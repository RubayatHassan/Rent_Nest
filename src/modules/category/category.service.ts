import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategory = async (payload: ICreateCategory) => {
  const result = await prisma.category.create({
    data: payload
  });

  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
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

const deleteCategory = async (categoryId: string) => {
  await prisma.category.delete({
    where: {
      id: categoryId
    }
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};
