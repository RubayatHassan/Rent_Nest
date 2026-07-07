import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { categoryController } from "../category/category.controller";
import { adminController } from "./admin.controller";

const router: Router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.get("/users/:id", auth(Role.ADMIN), adminController.getUserById);
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);
router.get("/properties", auth(Role.ADMIN), adminController.getAllProperties);
router.patch("/properties/:id/status", auth(Role.ADMIN), adminController.updatePropertyStatus);
router.get("/categories", auth(Role.ADMIN), categoryController.getAllCategories);
router.get("/categories/:categoryId", auth(Role.ADMIN), categoryController.getCategoryById);
router.post("/categories", auth(Role.ADMIN), categoryController.createCategory);
router.patch("/categories/:categoryId", auth(Role.ADMIN), categoryController.updateCategory);
router.get("/payments", auth(Role.ADMIN), adminController.getAllPayments);
router.get("/payments/:id", auth(Role.ADMIN), adminController.getPaymentById);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);
router.patch("/rentals/:id/status", auth(Role.ADMIN), adminController.updateRentalStatus);
router.delete("/reviews/:id", auth(Role.ADMIN), adminController.deleteReview);

export const adminRoutes: Router = router;