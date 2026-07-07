import { Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(req.user?.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment checkout session created successfully",
    data: result
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.confirmPayment(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed successfully",
    data: result
  });
});

const handleStripeSuccess = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.confirmStripePayment(req.query.session_id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe payment completed successfully. Tenant can now leave a review after rental completion.",
    data: result
  });
});

const handleStripeCancel = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    success: false,
    statusCode: httpStatus.OK,
    message: "Stripe payment was cancelled.",
    data: {
      paymentId: req.query.paymentId || null
    }
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getMyPayments(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: result
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentById(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role === Role.ADMIN
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  handleStripeSuccess,
  handleStripeCancel,
  getMyPayments,
  getPaymentById
};