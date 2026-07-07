import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalController } from "./rental.controller";

const router: Router = Router();

router.post("/", auth(Role.TENANT), rentalController.createRentalRequest);
router.get("/", auth(Role.TENANT), rentalController.getMyRentalRequests);
router.get("/:id", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), rentalController.getRentalRequestById);
router.patch("/:id/cancel", auth(Role.TENANT), rentalController.cancelRentalRequest);

export const rentalRoutes: Router = router;
