import express from "express";
import { getHealth, getDetailedHealth } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/", getHealth);

router.get("/detailed", getDetailedHealth);

export default router;
