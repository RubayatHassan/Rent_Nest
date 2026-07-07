import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReview, IUpdateReview } from "./review.interface";

const validateRating = (rating: number) => {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }
};

const createReview = async (tenantId: string, payload: ICreateReview) => {
  validateRating(payload.rating);

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

const updateMyReview = async (tenantId: string, reviewId: string, payload: IUpdateReview) => {
  if (payload.rating !== undefined) {
    validateRating(payload.rating);
  }

  const review = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId
    }
  });

  if (review.tenantId !== tenantId) {
    throw new Error("You can update only your own review.");
  }

  const result = await prisma.review.update({
    where: {
      id: reviewId
    },
    data: {
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

const deleteMyReview = async (tenantId: string, reviewId: string) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId
    }
  });

  if (review.tenantId !== tenantId) {
    throw new Error("You can delete only your own review.");
  }

  const result = await prisma.review.delete({
    where: {
      id: reviewId
    }
  });

  return result;
};

export const reviewService = {
  createReview,
  updateMyReview,
  deleteMyReview
};