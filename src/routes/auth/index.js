import express from "express";
import {
  register,
  verifyEmail,
  checkEmail,
  login,
} from "../../controllers/auth/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.get("/check-email", checkEmail);
router.post("/login", login);

export default router;
