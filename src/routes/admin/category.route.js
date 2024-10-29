import express from "express";

import {
  getCategories,
  getCategory,
  postCategory,
  putCategory,
} from "../../controllers/admin/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", postCategory);
router.put("/:id", putCategory);

export default router;
