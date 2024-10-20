import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import argon2 from "argon2";

import { ok, error, badRequest } from "../../handlers/respone.handler.js";
import { USER_ROLES } from "../../utils/constants/index.js";
import User from "../../models/user.model.js";
import { sendVerificationEmail } from "../../utils/functions/emailService.js";
// [POST] /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, user_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ user_email: email });
    if (existingUser) {
      return badRequest(res, "User already exists");
    }

    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user
    const newUser = new User({
      user_email: email,
      user_password: hashedPassword,
      user_role: USER_ROLES.USER,
      user_name: user_name,
      is_email_verified: false,
    });

    // Save the user to the database
    await newUser.save();

    // Create a verification token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    // Create a verification link
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationLink);

    return ok(res, { message: "User registered. Please check your email to verify your account." });
  } catch (err) {
    console.log("Err: " + err);
    return error(res, { message: "Internal server error" }, 500);
  }
};

// [GET] /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return badRequest(res, "Token is required");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return error(res, "User not found", 404);
    }
    if (user.is_email_verified == true) {
      return badRequest(res, "Account has already verified");
    }

    // Update email verification status
    user.is_email_verified = true;
    await user.save();
    // return res.redirect("/login?message=Email verified successfully. Please log in.");
    return res.redirect("https://www.forcatshop.com/login");
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.redirect("/error?message=Verification link has expired&action=resend");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return badRequest(res, "Invalid token");
    }
    console.log("Err: " + err);
    return error(res, "Internal server error");
  }
};
// [GET] /api/auth/check-email
export const checkEmail = async (req, res) => {
  try {
    let { email } = req.query;

    if (!email) {
      return badRequest(res, "Email is required");
    }
    email = email.trim();

    const existingUser = await User.findOne({ user_email: email });

    if (existingUser) {
      return ok(res, { exists: true, message: "Email is already registered" });
    } else {
      return ok(res, { exists: false, message: "Email is available" });
    }
  } catch (err) {
    console.log("Err: " + err);
    return error(res, { message: "Internal server error" }, 500);
  }
};
