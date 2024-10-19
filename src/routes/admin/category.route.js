import express from "express";

import { getCategories, getCategory } from "../../controllers/admin/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

export default router;
