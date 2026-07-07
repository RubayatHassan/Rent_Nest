import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReview = async (tenantId: string, payload: ICreateReview) => {
  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: payload.rentalRequestId,
      tenantId
    },
    include: {
      payment: true,
      review: true
    }
  });

  if (
    rentalRequest.status !== RentalRequestStatus.ACTIVE &&
    rentalRequest.status !== RentalRequestStatus.COMPLETED
  ) {
    throw new Error("Review can be created only after a successful payment.");
  }

  if (rentalRequest.payment?.status !== PaymentStatus.COMPLETED) {
    throw new Error("Review requires a completed payment.");
  }

  if (rentalRequest.review) {
    throw new Error("Review already exists for this rental request.");
  }

  const result = await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: rentalRequest.id,
      rating: payload.rating,
      comment: payload.comment
    },
    include: {
      property: true,
      tenant: {
        omit: {
          password: true
        }
      }
    }
  });

  return result;
};

export const reviewService = {
  createReview
};
