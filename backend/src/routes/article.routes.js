import express from "express";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  getArticlesByCategoryPath,
  updateArticle,
  getArticleStats,
} from "../controllers/article.controller.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", uploadSingle, createArticle);

// Category path route with regex
router.get(/^\/category\/(.+)$/, (req, res, next) => {
  const match = req.path.match(/^\/category\/(.+)$/);
  if (match) {
    req.params = req.params || {};
    req.params.categoryPath = match[1];
  }
  getArticlesByCategoryPath(req, res, next);
});

// IMPORTANT: Specific routes BEFORE dynamic routes
router.get("/stats", getArticleStats);  // ✅ Move this before /:id

// General routes
router.get("/", getAllArticles);

// Dynamic routes LAST
router.get("/:slug", getArticleBySlug);  // This will catch slugs
router.get("/:id", getArticleById);      // This will catch IDs

// Update and delete
router.put("/:id", uploadSingle, updateArticle);
router.patch("/:id", uploadSingle, updateArticle);
router.delete("/:id", deleteArticle);

export default router;
