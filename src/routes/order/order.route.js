import express from "express";
import { getOrders, getOrderById } from "../../controllers/user/order.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Tất cả các routes đều cần xác thực token
router.use(verifyToken);

router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router; 