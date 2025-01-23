import express from "express";

import { addCoupon, getCoupons } from "../../controllers/customer/coupon.controller.js";

const router = express.Router();

router.get("/", getCoupons);
router.post("/:userId", addCoupon);

export default router;
