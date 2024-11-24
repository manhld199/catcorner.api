import express from "express";
import productRouter from "./product.route.js";

const router = express.Router();

router.use("/products", productRouter);

export default router;
