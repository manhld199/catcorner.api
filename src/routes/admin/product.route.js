import express from "express";

import { getProducts } from "../../controllers/admin/product.controller";

const router = express.Router();

router.get("/getProducts", getProducts);

export default router;
