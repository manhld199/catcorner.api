import express from "express";

const router = express.Router();

const productRouter = require("./product.route");

router.use("/product", productRouter);

export default router;
