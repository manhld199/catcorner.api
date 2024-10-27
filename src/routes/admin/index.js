import express from "express";
import productRouter from "./product.route.js";
import categoryRouter from "./category.route.js";
import articleRouter from "./article.route.js";

const router = express.Router();

router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/articles", articleRouter);

export default router;
