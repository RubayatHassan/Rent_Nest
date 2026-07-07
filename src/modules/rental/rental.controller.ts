import { Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.createRentalRequest(req.user?.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request submitted successfully",
    data: result
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.getMyRentalRequests(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result
  });
});

const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.getRentalRequestById(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role === Role.ADMIN
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request details retrieved successfully",
    data: result
  });
});

const cancelRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.cancelRentalRequest(req.params.id as string, req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request cancelled successfully",
    data: result
  });
});

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  cancelRentalRequest
};
