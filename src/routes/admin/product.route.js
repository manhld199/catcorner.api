import express from "express";

import { getProducts } from "../../controllers/admin/product.controller.js";

const router = express.Router();

router.get("/getProducts", getProducts);

export default router;
