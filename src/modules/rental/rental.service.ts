import httpStatus from "http-status";
import { PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateRentalRequest } from "./rental.interface";

const createRentalRequest = async (tenantId: string, payload: ICreateRentalRequest) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: payload.propertyId
    }
  });

  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError(httpStatus.BAD_REQUEST, "This property is not available for rent.");
  }

  if (property.landlordId === tenantId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot submit a rental request for your own property.");
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: {
        in: [RentalRequestStatus.PENDING, RentalRequestStatus.APPROVED, RentalRequestStatus.ACTIVE]
      }
    }
  });

  if (existingRequest) {
    throw new AppError(httpStatus.CONFLICT, "You already have an active rental request for this property.");
  }

  const result = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      message: payload.message,
      moveInDate: payload.moveInDate,
      durationMonths: payload.durationMonths
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

const getMyRentalRequests = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      tenantId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      property: {
        include: {
          category: true
        }
      },
      payment: true,
      review: true
    }
  });

  return result;
};

const getRentalRequestById = async (requestId: string, userId: string, isAdmin: boolean) => {
  const result = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId
    },
    include: {
      tenant: {
        omit: {
          password: true
        }
      },
      property: true,
      payment: true,
      review: true
    }
  });

  const isTenant = result.tenantId === userId;
  const isLandlord = result.property.landlordId === userId;

  if (!isAdmin && !isTenant && !isLandlord) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to view this rental request.");
  }

  return result;
};

const cancelRentalRequest = async (requestId: string, tenantId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId,
      tenantId
    }
  });

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only pending rental requests can be cancelled.");
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: RentalRequestStatus.CANCELLED
    }
  });

  return result;
};

export const rentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  cancelRentalRequest
};
