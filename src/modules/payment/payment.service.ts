import { PaymentProvider, PaymentStatus, PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { IConfirmPayment, ICreatePayment } from "./payment.interface";

const toStripeAmount = (amount: unknown, currency: string) => {
  const numericAmount = Number(amount);

  if (currency.toLowerCase() === "bdt") {
    return Math.round(numericAmount);
  }

  return Math.round(numericAmount * 100);
};

const completePaymentInDB = async (paymentId: string, transactionId: string, gatewayResponse: object) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId
    },
    include: {
      rentalRequest: true
    }
  });

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        transactionId,
        status: PaymentStatus.COMPLETED,
        gatewayResponse: gatewayResponse as any,
        paidAt: new Date()
      }
    });

    await tx.rentalRequest.update({
      where: {
        id: payment.rentalRequestId
      },
      data: {
        status: RentalRequestStatus.ACTIVE
      }
    });

    await tx.property.update({
      where: {
        id: payment.rentalRequest.propertyId
      },
      data: {
        status: PropertyStatus.RENTED
      }
    });

    return updatedPayment;
  });

  return result;
};

const createPayment = async (userId: string, payload: ICreatePayment) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: payload.rentalRequestId,
      tenantId: userId
    },
    include: {
      property: true,
      tenant: true,
      payment: true
    }
  });

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new Error("Payment can be created only for approved rental requests.");
  }

  if (rentalRequest.payment?.status === PaymentStatus.COMPLETED) {
    throw new Error("This rental request is already paid.");
  }

  if (payload.provider !== PaymentProvider.STRIPE) {
    const existingPayment = rentalRequest.payment;

    if (existingPayment) {
      return existingPayment;
    }

    return prisma.payment.create({
      data: {
        rentalRequestId: rentalRequest.id,
        userId,
        amount: rentalRequest.property.rentAmount,
        provider: payload.provider,
        method: payload.method,
        transactionId: `RN-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        status: PaymentStatus.PENDING
      }
    });
  }

  if (!config.stripe_secret_key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  const payment = rentalRequest.payment || await prisma.payment.create({
    data: {
      rentalRequestId: rentalRequest.id,
      userId,
      amount: rentalRequest.property.rentAmount,
      provider: payload.provider,
      method: payload.method,
      status: PaymentStatus.PENDING
    }
  });

  const oldGatewayResponse = payment.gatewayResponse as { checkoutUrl?: string; stripeSessionId?: string } | null;

  if (oldGatewayResponse?.checkoutUrl && oldGatewayResponse?.stripeSessionId) {
    return {
      payment,
      paymentUrl: oldGatewayResponse.checkoutUrl,
      stripeSessionId: oldGatewayResponse.stripeSessionId,
      successUrl: `${config.server_url}/api/payments/success?session_id=${oldGatewayResponse.stripeSessionId}`,
      demoCard: "4242 4242 4242 4242"
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: rentalRequest.tenant.email,
    line_items: [
      {
        price_data: {
          currency: config.stripe_currency,
          product_data: {
            name: rentalRequest.property.title,
            description: rentalRequest.property.location
          },
          unit_amount: toStripeAmount(rentalRequest.property.rentAmount, config.stripe_currency)
        },
        quantity: 1
      }
    ],
    success_url: `${config.server_url}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.server_url}/api/payments/cancel?paymentId=${payment.id}`,
    metadata: {
      paymentId: payment.id,
      rentalRequestId: rentalRequest.id,
      tenantId: userId,
      propertyId: rentalRequest.propertyId
    }
  });

  const updatedPayment = await prisma.payment.update({
    where: {
      id: payment.id
    },
    data: {
      transactionId: session.id,
      gatewayResponse: {
        stripeSessionId: session.id,
        checkoutUrl: session.url,
        paymentStatus: session.payment_status
      }
    }
  });

  return {
    payment: updatedPayment,
    paymentUrl: session.url,
    stripeSessionId: session.id,
    successUrl: `${config.server_url}/api/payments/success?session_id=${session.id}`,
    cancelUrl: `${config.server_url}/api/payments/cancel?paymentId=${payment.id}`,
    demoCard: "4242 4242 4242 4242"
  };
};

const confirmStripePayment = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Stripe session_id is required.");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Stripe payment is not completed yet.");
  }

  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    throw new Error("Payment id not found in Stripe session metadata.");
  }

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.id;

  return completePaymentInDB(paymentId, paymentIntentId, {
    stripeSessionId: session.id,
    paymentIntentId,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email || session.customer_email
  });
};

const confirmPayment = async (payload: IConfirmPayment) => {
  if (payload.stripeSessionId) {
    return confirmStripePayment(payload.stripeSessionId);
  }

  const payment = await prisma.payment.findFirstOrThrow({
    where: {
      OR: [
        {
          id: payload.paymentId
        },
        {
          transactionId: payload.transactionId
        }
      ]
    },
    include: {
      rentalRequest: true
    }
  });

  if (payload.status === PaymentStatus.COMPLETED) {
    return completePaymentInDB(
      payment.id,
      payload.transactionId || payment.transactionId || `RN-${Date.now()}`,
      payload.gatewayResponse || {}
    );
  }

  const result = await prisma.payment.update({
    where: {
      id: payment.id
    },
    data: {
      status: payload.status,
      gatewayResponse: payload.gatewayResponse as any
    }
  });

  return result;
};

const getMyPayments = async (userId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      rentalRequest: {
        include: {
          property: true
        }
      }
    }
  });

  return result;
};

const getPaymentById = async (paymentId: string, userId: string, isAdmin: boolean) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId
    },
    include: {
      rentalRequest: {
        include: {
          property: true
        }
      }
    }
  });

  const isTenant = payment.userId === userId;
  const isLandlord = payment.rentalRequest.property.landlordId === userId;

  if (!isAdmin && !isTenant && !isLandlord) {
    throw new Error("You are not allowed to view this payment.");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  confirmStripePayment,
  getMyPayments,
  getPaymentById
};