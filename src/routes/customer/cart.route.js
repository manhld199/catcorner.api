import express from "express";

import { getCartProducts } from "../../controllers/guest/cart.controller.js";

const router = express.Router();

router.post("/", getCartProducts);

export default router;
