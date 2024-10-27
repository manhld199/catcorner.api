import express from "express";

import {
  getArticles,
  getArticle,
  putArticle,
  postArticle,
} from "../../controllers/admin/article.controller.js";

const router = express.Router();

router.get("/", getArticles);
router.get("/:id", getArticle);
router.post("/", postArticle);
router.put("/:id", putArticle);

export default router;
