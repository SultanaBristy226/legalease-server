import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import lawyerRoutes from "./routes/lawyerRoutes.js";
import hiringRoutes from "./routes/hiringRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import shortlistRoutes from "./routes/shortlistRoutes.js";  // ← যোগ করো

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/hiring", hiringRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/shortlist", shortlistRoutes);  // ← যোগ করো

// Health Check
app.get("/", (req, res) => {
  res.send("🟢 LegalEase server is running!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// Vercel Export
export default app;

// Local Development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}