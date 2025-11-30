import express from "express";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  getArticlesByCategoryPath,
  updateArticle,
} from "../controllers/article.controller.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", uploadSingle, createArticle);

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

router.get("/:identifier", async (req, res, next) => {
  const { identifier } = req.params;

  if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // It's an ID
    req.params.id = identifier;
    return getArticleById(req, res, next);
  } else {
    // It's a slug
    req.params.slug = identifier;
    return getArticleBySlug(req, res, next);
  }
});
router.put("/:id", uploadSingle, updateArticle);
router.patch("/:id", uploadSingle, updateArticle);
router.delete("/:id", deleteArticle);

export default router;
