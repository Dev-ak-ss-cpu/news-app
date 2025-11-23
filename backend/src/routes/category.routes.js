import express from "express";
import {
  createOrUpdateCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", createOrUpdateCategory);

router.get("/", getAllCategories);

router.delete("/:id", deleteCategory);

export default router;
