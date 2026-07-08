import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { landlordService } from "./landlord.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.createProperty(req.user?.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property listing created successfully",
    data: result
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.getMyProperties(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord properties retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.updateProperty(
    req.params.id as string,
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property listing updated successfully",
    data: result
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.deleteProperty(req.params.id as string, req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property listing removed successfully",
    data: null
  });
});

const getRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.getRentalRequests(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord rental requests retrieved successfully",
    data: result
  });
});

const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.updateRentalRequestStatus(
    req.params.id as string,
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request status updated successfully",
    data: result
  });
});

export const landlordController = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getRentalRequests,
  updateRentalRequestStatus
};
