import express from "express";
import cartRouter from "./cart.route.js";

const router = express.Router();

router.use("/cart", cartRouter);

export default router;
