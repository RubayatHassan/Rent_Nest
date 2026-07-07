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
  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
      profilePhoto: payload.profilePhoto
    },
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