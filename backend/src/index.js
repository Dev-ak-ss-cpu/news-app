import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { MongoDB } from "./utils/database.connection.js";
import categoryRoutes from "./routes/category.routes.js";
import articleRoutes from "./routes/article.routes.js";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        console.log("✅ CORS allowed for:", origin);
        cb(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
MongoDB();

app.use("/api/categories", categoryRoutes);
app.use("/api/articles", articleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
