import express from "express";
import productListRoutes from "./productList.route.js";
import productRoutes from "./product.route.js";

const router = express.Router();

router.use("/product", productRoutes);
router.use("/productList", productListRoutes);

export default router;
