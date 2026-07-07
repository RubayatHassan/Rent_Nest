import { PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdatePropertyStatus, IUpdateRentalStatus, IUpdateUserStatus } from "./admin.interface";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    },
    omit: {
      password: true
    },
    include: {
      _count: {
        select: {
          properties: true,
          rentalRequests: true,
          payments: true,
          reviews: true
        }
      }
    }
  });

  return result;
};

const updateUserStatus = async (userId: string, payload: IUpdateUserStatus) => {
  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      activeStatus: payload.activeStatus
    },
    omit: {
      password: true
    }
  });

  return result;
};

const getAllProperties = async () => {
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        category: true,
        landlord: {
          omit: {
            password: true
          }
        },
        _count: {
          select: {
            rentalRequests: true,
            reviews: true
          }
        }
      }
    }),
    prisma.property.count()
  ]);

  return {
    data: properties,
    meta: {
      page: 1,
      limit: total,
      total,
      totalPages: total > 0 ? 1 : 0
    }
  };
};

const updatePropertyStatus = async (propertyId: string, payload: IUpdatePropertyStatus) => {
  const result = await prisma.property.update({
    where: {
      id: propertyId
    },
    data: {
      status: payload.status
    }
  });

  return result;
};

const getAllRentals = async () => {
  const result = await prisma.rentalRequest.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      tenant: {
        omit: {
          password: true
        }
      },
      property: {
        include: {
          landlord: {
            omit: {
              password: true
            }
          }
        }
      },
      payment: true,
      review: true
    }
  });

  return result;
};

const updateRentalStatus = async (rentalId: string, payload: IUpdateRentalStatus) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalId
    },
    include: {
      property: true
    }
  });

  const result = await prisma.$transaction(async (tx) => {
    const updatedRental = await tx.rentalRequest.update({
      where: {
        id: rentalId
      },
      data: {
        status: payload.status
      }
    });

    if (payload.status === RentalRequestStatus.COMPLETED) {
      await tx.property.update({
        where: {
          id: rentalRequest.propertyId
        },
        data: {
          status: PropertyStatus.AVAILABLE
        }
      });
    }

    return updatedRental;
  });

  return result;
};

const getAllPayments = async () => {
  const result = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        omit: {
          password: true
        }
      },
      rentalRequest: {
        include: {
          tenant: {
            omit: {
              password: true
            }
          },
          property: {
            include: {
              category: true,
              landlord: {
                omit: {
                  password: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result;
};


const deleteReview = async (reviewId: string) => {
  const result = await prisma.review.delete({
    where: {
      id: reviewId
    },
    include: {
      tenant: {
        omit: {
          password: true
        }
      },
      property: true,
      rentalRequest: true
    }
  });

  return result;
};
const getPaymentById = async (paymentId: string) => {
  const result = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId
    },
    include: {
      user: {
        omit: {
          password: true
        }
      },
      rentalRequest: {
        include: {
          tenant: {
            omit: {
              password: true
            }
          },
          property: {
            include: {
              category: true,
              landlord: {
                omit: {
                  password: true
                }
              }
            }
          },
          review: true
        }
      }
    }
  });

  return result;
};
export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  updatePropertyStatus,
  getAllRentals,
  updateRentalStatus,
  getAllPayments,
  getPaymentById,
  deleteReview
};
