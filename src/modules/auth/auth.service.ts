import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config/index";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser, IRegisterUser } from "./auth.interface";

const createAuthTokens = (user: { id: string; name: string; email: string; role: Role }) => {
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions
  );

  return { accessToken, refreshToken };
};

const registerUser = async (payload: IRegisterUser) => {
  if (payload.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin registration is not allowed from public endpoint.");
  }

  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      phone: payload.phone,
      address: payload.address,
      profilePhoto: payload.profilePhoto
    },
    omit: {
      password: true
    }
  });

  const tokens = createAuthTokens(user);

  return {
    user,
    ...tokens
  };
};

const loginUser = async (payload: ILoginUser) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email
    }
  });

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect.");
  }

  return createAuthTokens(user);
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      password: true
    }
  });

  return user;
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

  if (!verifiedRefreshToken.success) {
    throw new AppError(httpStatus.UNAUTHORIZED, verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked.");
  }

  const { accessToken } = createAuthTokens(user);

  return { accessToken };
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
  refreshToken
};