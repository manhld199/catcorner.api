import express from "express";
import { createPaymentLink } from "../../controllers/general/payos.controller.js";

const router = express.Router();

router.post("/create-payment-link", createPaymentLink);

export default router;
