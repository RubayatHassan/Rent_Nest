import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getMyProfile(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile retrieved successfully",
    data: result
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateMyProfile(req.user?.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result
  });
});

const removeMyProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.removeMyProfilePhoto(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile photo removed successfully",
    data: result
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.id as string);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Account deleted successfully",
    data: null
  });
});

export const userController = {
  getMyProfile,
  updateMyProfile,
  removeMyProfilePhoto,
  deleteMyAccount
};