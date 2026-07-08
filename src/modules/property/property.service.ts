import { PropertyStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPropertyQuery } from "./property.interface";

const allowedSortFields = ["createdAt", "updatedAt", "rentAmount", "title", "location"] as const;

const getPositiveNumber = (value: string | undefined, fallback: number, max?: number) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return fallback;
  }

  return max ? Math.min(numericValue, max) : numericValue;
};

const getAllProperties = async (query: IPropertyQuery) => {
  const limit = getPositiveNumber(query.limit, 10, 100);
  const page = getPositiveNumber(query.page, 1);
  const skip = (page - 1) * limit;
  const sortBy = allowedSortFields.includes(query.sortBy as any) ? query.sortBy as string : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: PropertyWhereInput[] = [
    {
      status: PropertyStatus.AVAILABLE
    }
  ];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
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
      ]
    });
  }

  if (query.location) {
    andConditions.push({
      location: {
        contains: query.location,
        mode: "insensitive"
      }
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      rentAmount: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined
      }
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId
    });
  }

  if (query.propertyType) {
    andConditions.push({
      category: {
        name: {
          contains: query.propertyType,
          mode: "insensitive"
        }
      }
    });
  }

  if (query.amenities) {
    const amenities = query.amenities.split(",").map((item) => item.trim()).filter(Boolean);
    andConditions.push({
      amenities: {
        hasSome: amenities
      }
    });
  }

  const where = {
    AND: andConditions
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        category: true,
        landlord: {
          omit: {
            password: true
          }
        },
        reviews: true,
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
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
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
      reviews: {
        include: {
          tenant: {
            omit: {
              password: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  return result;
};

export const propertyService = {
  getAllProperties,
  getPropertyById
};