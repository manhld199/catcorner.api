import express from "express";

import { getProducts } from "../../controllers/guest/product.controller";

const router = express.Router();

router.get("/getProducts", getProducts);

export default router;
