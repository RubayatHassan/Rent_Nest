import { PaymentMethod, PaymentProvider, PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreatePayment {
  rentalRequestId: string;
  provider: PaymentProvider;
  method?: PaymentMethod;
}

export interface IConfirmPayment {
  paymentId?: string;
  transactionId?: string;
  stripeSessionId?: string;
  status: PaymentStatus;
  gatewayResponse?: object;
}