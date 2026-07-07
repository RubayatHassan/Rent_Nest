import { prisma } from "../../lib/prisma";
import { IUpdateMyProfile } from "./user.interface";

const getMyProfile = async (userId: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      password: true
    }
  });

  return result;
};

const updateMyProfile = async (userId: string, payload: IUpdateMyProfile) => {
  const allowedFields: (keyof IUpdateMyProfile)[] = ["name", "phone", "address", "profilePhoto"];
  const updateData: Record<string, string | null> = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field) && payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

  if (!Object.keys(updateData).length) {
    throw new Error("No valid profile field provided for update.");
  }

  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: updateData,
    omit: {
      password: true
    }
  });

  return result;
};

const removeMyProfilePhoto = async (userId: string) => {
  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      profilePhoto: null
    },
    omit: {
      password: true
    }
  });

  return result;
};

const deleteMyAccount = async (userId: string) => {
  await prisma.user.delete({
    where: {
      id: userId
    }
  });
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  removeMyProfilePhoto,
  deleteMyAccount
};