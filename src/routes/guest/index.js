import express from "express";
import productListRoutes from "./productList.route.js";
import productRoutes from "./product.route.js";
import categoryRouter from "./category.route.js";

const router = express.Router();

router.use("/product", productRoutes);
router.use("/productList", productListRoutes);
router.use("/categories", categoryRouter);

export default router;
