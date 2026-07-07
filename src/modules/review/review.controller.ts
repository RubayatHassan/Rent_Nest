import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req.user?.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result
  });
});

const updateMyReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.updateMyReview(req.user?.id as string, req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result
  });
});

const deleteMyReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.deleteMyReview(req.user?.id as string, req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result
  });
});

export const reviewController = {
  createReview,
  updateMyReview,
  deleteMyReview
};