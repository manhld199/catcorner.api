import express from "express";

import { getProducts } from "../../controllers/guest/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

export default router;
