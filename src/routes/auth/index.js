import express from "express";
import {
  register,
  verifyEmail,
  checkEmail,
  login,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
  refreshToken
} from "../../controllers/auth/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.get("/check-email", checkEmail);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookAuthCallback);

export default router;
