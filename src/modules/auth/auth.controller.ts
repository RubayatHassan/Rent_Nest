import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "none" as const
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24
  });

  res.cookie("refreshToken", result.refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24
  });

  res.cookie("refreshToken", result.refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current user retrieved successfully",
    data: result
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.cookies.refreshToken);

  res.cookie("accessToken", result.accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token refreshed successfully",
    data: result
  });
});

export const authController = {
  registerUser,
  loginUser,
  getMe,
  refreshToken
};
