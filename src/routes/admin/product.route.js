import express from "express";

import {
  getProducts,
  getProduct,
  putProduct,
  postProduct,
} from "../../controllers/admin/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", postProduct);
router.put("/:id", putProduct);

export default router;
