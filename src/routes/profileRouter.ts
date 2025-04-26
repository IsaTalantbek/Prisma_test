import { Router } from "express";
import userProfileController from "../controllers/profile/userProfileController.js";
import userLoginProfileController from "../controllers/profile/userLoginProfileController.js";
import profileController from "../controllers/profile/profileController.js";
import profileUpdateController from "../controllers/profile/profileUpdateController.js";

const router = Router();

router.get("/:id", userProfileController);

router.get("/s/:login", userLoginProfileController);

router.get("/", profileController);

router.post("/update", profileUpdateController);

export default router;
