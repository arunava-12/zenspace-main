import express from "express";
import cors from "cors";

import authRoutes from "./auth";
import userRoutes from "./routes/user";
import projectRoutes from "./routes/project";
import workspaceRoutes from "./routes/workspace";
import taskRoutes from "./routes/task";
import aiRoutes from "./routes/ai";
import commentRoutes from "./routes/comment";
import fileRoutes from "./routes/file";

// Catch unexpected crashes so Railway logs show real error
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const app = express();

// 🔥 VERY IMPORTANT (add this line)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// 🔍 LOG ALL REQUESTS
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes); // 🔥 ADD THIS
app.use("/api/ai", aiRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/files", fileRoutes);

// Health / Root Route
app.get("/", (_req, res) => {
  res.status(200).send("ZenSpace API Running");
});

// ✅ ADD THIS (CRITICAL)
app.head("/", (_req, res) => {
  res.status(200).end();
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ SERVER ERROR:", err);

  // Prisma specific connection errors
  if (err.code === 'P1001' || err.message?.includes("Can't reach database server")) {
    return res.status(503).json({
      error: "Database connection failed. The server might be waking up, please try again in 5-10 seconds.",
      code: "DB_CONNECTION_ERROR"
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Port Handling (Railway Safe)
const PORT = Number(process.env.PORT) || 4000;

console.log("ENV PORT:", process.env.PORT);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});