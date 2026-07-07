import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router: Router = Router();

router.post("/", auth(Role.TENANT), reviewController.createReview);

export const reviewRoutes: Router = router;
