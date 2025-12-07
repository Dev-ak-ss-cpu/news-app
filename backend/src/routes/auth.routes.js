import express from "express";
import { login, signup, logout, verifyAuth } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.get("/verify", verifyAuth);

export default router;
