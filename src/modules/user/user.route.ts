import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { userController } from "./user.controller";

const router: Router = Router();

router.get("/me", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), userController.getMyProfile);
router.patch("/me", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), userController.updateMyProfile);
router.delete("/me/profile-photo", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), userController.removeMyProfilePhoto);
router.delete("/me", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), userController.deleteMyAccount);

export const userRoutes: Router = router;