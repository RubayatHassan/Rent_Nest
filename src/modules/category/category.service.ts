import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

type TCategoryQuery = Record<string, string | undefined>;

const getPagination = (query: TCategoryQuery) => {
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

const createCategory = async (payload: ICreateCategory) => {
  const result = await prisma.category.create({
    data: payload
  });

  return result;
};

const getAllCategories = async (query: TCategoryQuery = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where = query.searchTerm
    ? {
        OR: [
          {
            name: {
              contains: query.searchTerm,
              mode: "insensitive" as const
            }
          },
          {
            description: {
              contains: query.searchTerm,
              mode: "insensitive" as const
            }
          }
        ]
      }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        name: "asc"
      },
      include: {
        _count: {
          select: {
            properties: true
          }
        }
      }
    }),
    prisma.category.count({ where })
  ]);

  return {
    data: categories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getCategoryById = async (categoryId: string) => {
  const result = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId
    },
    include: {
      properties: {
        orderBy: {
          createdAt: "desc"
        }
      },
      _count: {
        select: {
          properties: true
        }
      }
    }
  });

  return result;
};

const updateCategory = async (categoryId: string, payload: IUpdateCategory) => {
  const result = await prisma.category.update({
    where: {
      id: categoryId
    },
    data: payload
  });

  return result;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
};