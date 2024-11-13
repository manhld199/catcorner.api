import express from "express";
import { getProfile, updateProfile } from "../../controllers/user/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router; 