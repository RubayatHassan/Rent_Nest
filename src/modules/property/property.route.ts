import { Router } from "express";
import { propertyController } from "./property.controller";

const router: Router = Router();

router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);

export const propertyRoutes: Router = router;
