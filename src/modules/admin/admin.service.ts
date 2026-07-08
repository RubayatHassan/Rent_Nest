import { ActiveStatus, PaymentProvider, PaymentStatus, PropertyStatus, RentalRequestStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdatePropertyStatus, IUpdateRentalStatus, IUpdateUserStatus } from "./admin.interface";

type TAdminQuery = Record<string, string | undefined>;

const getPagination = (query: TAdminQuery) => {
  const pageValue = Number(query.page);
  const limitValue = Number(query.limit);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const getMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
});

const isEnumValue = <T extends Record<string, string>>(enumObject: T, value: string | undefined): value is T[keyof T] => {
  return !!value && Object.values(enumObject).includes(value);
};

const getAllUsers = async (query: TAdminQuery = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};

  if (query.searchTerm) {
    where.OR = [
      {
        name: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      },
      {
        email: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      },
      {
        phone: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      }
    ];
  }

  if (isEnumValue(Role, query.role)) {
    where.role = query.role;
  }

  if (isEnumValue(ActiveStatus, query.activeStatus)) {
    where.activeStatus = query.activeStatus;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip,
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
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users,
    meta: getMeta(page, limit, total)
  };
};

const getUserById = async (userId: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      password: true
    },
    include: {
      properties: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          category: true
        }
      },
      rentalRequests: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          property: true,
          payment: true,
          review: true
        }
      },
      payments: {
        orderBy: {
          createdAt: "desc"
        }
      },
      reviews: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          property: true
        }
      },
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

const getAllProperties = async (query: TAdminQuery = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};

  if (query.searchTerm) {
    where.OR = [
      {
        title: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      },
      {
        location: {
          contains: query.searchTerm,
          mode: "insensitive"
        }
      }
    ];
  }

  if (query.location) {
    where.location = {
      contains: query.location,
      mode: "insensitive"
    };
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.landlordId) {
    where.landlordId = query.landlordId;
  }

  if (isEnumValue(PropertyStatus, query.status)) {
    where.status = query.status;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      take: limit,
      skip,
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
    prisma.property.count({ where })
  ]);

  return {
    data: properties,
    meta: getMeta(page, limit, total)
  };
};

const getPropertyById = async (propertyId: string) => {
  const result = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId
    },
    include: {
      category: true,
      landlord: {
        omit: {
          password: true
        }
      },
      rentalRequests: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          tenant: {
            omit: {
              password: true
            }
          },
          payment: true,
          review: true
        }
      },
      reviews: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          tenant: {
            omit: {
              password: true
            }
          }
        }
      },
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

const getAllRentals = async (query: TAdminQuery = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};

  if (isEnumValue(RentalRequestStatus, query.status)) {
    where.status = query.status;
  }

  if (query.tenantId) {
    where.tenantId = query.tenantId;
  }

  if (query.propertyId) {
    where.propertyId = query.propertyId;
  }

  if (query.landlordId) {
    where.property = {
      landlordId: query.landlordId
    };
  }

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      take: limit,
      skip,
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
    }),
    prisma.rentalRequest.count({ where })
  ]);

  return {
    data: rentals,
    meta: getMeta(page, limit, total)
  };
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

const getAllPayments = async (query: TAdminQuery = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.rentalRequestId) {
    where.rentalRequestId = query.rentalRequestId;
  }

  if (isEnumValue(PaymentStatus, query.status)) {
    where.status = query.status;
  }

  if (isEnumValue(PaymentProvider, query.provider)) {
    where.provider = query.provider;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      take: limit,
      skip,
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
    }),
    prisma.payment.count({ where })
  ]);

  return {
    data: payments,
    meta: getMeta(page, limit, total)
  };
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
  getUserById,
  updateUserStatus,
  getAllProperties,
  getPropertyById,
  updatePropertyStatus,
  getAllRentals,
  updateRentalStatus,
  getAllPayments,
  getPaymentById,
  deleteReview
};