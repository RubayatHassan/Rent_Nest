import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router: Router = Router();

router.post("/create", auth(Role.TENANT), paymentController.createPayment);
router.post("/confirm", paymentController.confirmPayment);
router.get("/success", paymentController.handleStripeSuccess);
router.get("/cancel", paymentController.handleStripeCancel);
router.get("/", auth(Role.TENANT), paymentController.getMyPayments);
router.get("/:id", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes: Router = router;