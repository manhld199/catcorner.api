import express from "express";
import {
  getOrders,
  getOrderById,
  trackOrder,
  getOrderByOrderId,
  cancelOrder,
} from "../../controllers/user/order.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Route không cần xác thực
router.get("/track", trackOrder);
router.get("/getOrder/:orderId", getOrderByOrderId);
router.put("/cancel/:orderId", cancelOrder);

// Các routes khác cần xác thực token
router.use(verifyToken);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
