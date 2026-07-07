import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router: Router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.patch("/:categoryId", auth(Role.ADMIN), categoryController.updateCategory);

export const categoryRoutes: Router = router;