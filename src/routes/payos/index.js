import express from "express";
import {
  createPaymentLink,
  handlePaymentWebhook,
} from "../../controllers/general/payos.controller.js";

const router = express.Router();

router.post("/create-payment-link", createPaymentLink);
router.post("/webhook", handlePaymentWebhook);

export default router;
