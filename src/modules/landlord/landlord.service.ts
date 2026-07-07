import { PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateProperty, IUpdateProperty } from "../property/property.interface";

const createProperty = async (landlordId: string, payload: ICreateProperty) => {
  const result = await prisma.property.create({
    data: {
      ...payload,
      amenities: payload.amenities || [],
      images: payload.images || [],
      landlordId
    },
    include: {
      category: true
    }
  });

  return result;
};

const getMyProperties = async (landlordId: string) => {
  const result = await prisma.property.findMany({
    where: {
      landlordId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      category: true,
      _count: {
        select: {
          rentalRequests: true,
          reviews: true
        }
      }
    }
  });

  return result;
};

const updateProperty = async (propertyId: string, landlordId: string, payload: IUpdateProperty) => {
  await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
      landlordId
    }
  });

  const result = await prisma.property.update({
    where: {
      id: propertyId
    },
    data: payload,
    include: {
      category: true
    }
  });

  return result;
};

const deleteProperty = async (propertyId: string, landlordId: string) => {
  await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
      landlordId
    }
  });

  await prisma.property.delete({
    where: {
      id: propertyId
    }
  });
};

const getRentalRequests = async (landlordId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      tenant: {
        omit: {
          password: true
        }
      },
      property: true,
      payment: true
    }
  });

  return result;
};

const updateRentalRequestStatus = async (
  requestId: string,
  landlordId: string,
  payload: { status: RentalRequestStatus }
) => {
  if (
    payload.status !== RentalRequestStatus.APPROVED &&
    payload.status !== RentalRequestStatus.REJECTED
  ) {
    throw new Error("Landlord can only approve or reject a rental request.");
  }

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId
    },
    include: {
      property: true
    }
  });

  if (rentalRequest.property.landlordId !== landlordId) {
    throw new Error("You are not allowed to manage this rental request.");
  }

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new Error("Only pending rental requests can be updated.");
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: payload.status
    },
    include: {
      tenant: {
        omit: {
          password: true
        }
      },
      property: true
    }
  });

  if (payload.status === RentalRequestStatus.APPROVED) {
    await prisma.property.update({
      where: {
        id: rentalRequest.propertyId
      },
      data: {
        status: PropertyStatus.UNAVAILABLE
      }
    });
  }

  return result;
};

export const landlordService = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getRentalRequests,
  updateRentalRequestStatus
};
