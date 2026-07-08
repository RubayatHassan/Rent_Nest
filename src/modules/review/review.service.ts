import httpStatus from "http-status";
import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReview, IUpdateReview } from "./review.interface";

const validateRating = (rating: number | string) => {
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating must be an integer between 1 and 5.");
  }

  return numericRating;
};

const createReview = async (tenantId: string, payload: ICreateReview) => {
  const rating = validateRating(payload.rating);

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
    throw new AppError(httpStatus.BAD_REQUEST, "Review can be created only after a successful payment.");
  }

  if (rentalRequest.payment?.status !== PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Review requires a completed payment.");
  }

  if (rentalRequest.review) {
    throw new AppError(httpStatus.CONFLICT, "Review already exists for this rental request.");
  }

  const result = await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: rentalRequest.id,
      rating,
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

const updateMyReview = async (tenantId: string, reviewOrRentalRequestId: string, payload: IUpdateReview) => {
  if (payload.rating === undefined && payload.comment === undefined) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating or comment is required to update a review.");
  }

  const review = await prisma.review.findFirstOrThrow({
    where: {
      tenantId,
      OR: [
        {
          id: reviewOrRentalRequestId
        },
        {
          rentalRequestId: reviewOrRentalRequestId
        }
      ]
    }
  });

  const updateData: { rating?: number; comment?: string } = {};

  if (payload.rating !== undefined) {
    updateData.rating = validateRating(payload.rating);
  }

  if (payload.comment !== undefined) {
    updateData.comment = payload.comment;
  }

  const result = await prisma.review.update({
    where: {
      id: review.id
    },
    data: updateData,
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

const deleteMyReview = async (tenantId: string, reviewOrRentalRequestId: string) => {
  const review = await prisma.review.findFirstOrThrow({
    where: {
      tenantId,
      OR: [
        {
          id: reviewOrRentalRequestId
        },
        {
          rentalRequestId: reviewOrRentalRequestId
        }
      ]
    }
  });

  const result = await prisma.review.delete({
    where: {
      id: review.id
    }
  });

  return result;
};

export const reviewService = {
  createReview,
  updateMyReview,
  deleteMyReview
};