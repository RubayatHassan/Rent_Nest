import { PaymentStatus, PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IConfirmPayment, ICreatePayment } from "./payment.interface";

const createPayment = async (userId: string, payload: ICreatePayment) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: payload.rentalRequestId,
      tenantId: userId
    },
    include: {
      property: true,
      payment: true
    }
  });

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new Error("Payment can be created only for approved rental requests.");
  }

  if (rentalRequest.payment) {
    return rentalRequest.payment;
  }

  const transactionId = `RN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const result = await prisma.payment.create({
    data: {
      rentalRequestId: rentalRequest.id,
      userId,
      amount: rentalRequest.property.rentAmount,
      provider: payload.provider,
      method: payload.method,
      transactionId,
      status: PaymentStatus.PENDING
    }
  });

  return result;
};

const confirmPayment = async (payload: IConfirmPayment) => {
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

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: payload.status,
        gatewayResponse: payload.gatewayResponse,
        paidAt: payload.status === PaymentStatus.COMPLETED ? new Date() : undefined
      }
    });

    if (payload.status === PaymentStatus.COMPLETED) {
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
    }

    return updatedPayment;
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
  getMyPayments,
  getPaymentById
};
