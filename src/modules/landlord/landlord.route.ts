import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { landlordController } from "./landlord.controller";

const router: Router = Router();

router.post("/properties", auth(Role.LANDLORD), landlordController.createProperty);
router.get("/properties", auth(Role.LANDLORD), landlordController.getMyProperties);
router.put("/properties/:id", auth(Role.LANDLORD), landlordController.updateProperty);
router.delete("/properties/:id", auth(Role.LANDLORD), landlordController.deleteProperty);
router.get("/requests", auth(Role.LANDLORD), landlordController.getRentalRequests);
router.patch("/requests/:id", auth(Role.LANDLORD), landlordController.updateRentalRequestStatus);

export const landlordRoutes: Router = router;
