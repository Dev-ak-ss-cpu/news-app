import express from "express";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategoryPath,
  updateArticle,
} from "../controllers/article.controller.js";

const router = express.Router();

router.post("/", createArticle);

router.get(/^\/category\/(.+)$/, (req, res, next) => {
  // Extract the category path from the regex match
  const match = req.path.match(/^\/category\/(.+)$/);
  if (match) {
    req.params = req.params || {};
    req.params.categoryPath = match[1];
  }
  getArticlesByCategoryPath(req, res, next);
});

router.get("/", getAllArticles);

router.get("/:slug", getArticleBySlug);

router.put("/:id", updateArticle);
router.patch("/:id", updateArticle);

router.delete("/:id", deleteArticle);

export default router;
