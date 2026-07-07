import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateUserStatus(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllProperties();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updatePropertyStatus(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property status updated successfully",
    data: result
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllRentals();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateRentalStatus(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental status updated successfully",
    data: result
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllPayments();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: result
  });
});


const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteReview(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result
  });
});
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getPaymentById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result
  });
});
export const adminController = {
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
