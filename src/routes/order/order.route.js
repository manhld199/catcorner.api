import express from "express";
import { getOrders, getOrderById, trackOrder } from "../../controllers/user/order.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Route tra cứu đơn hàng không cần xác thực
router.get("/track", trackOrder);

// Các routes khác cần xác thực token
router.use(verifyToken);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router; 