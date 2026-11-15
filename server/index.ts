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

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL!,
      "http://localhost:5173", // For local development
    ],
    credentials: true,
  })
);
app.use(express.json());

// Log all requests (including legacy route requests)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Canonical API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/files", fileRoutes);

// Backward-compatible alias: the deployed invite UI currently calls
// /projects/:projectId/invites without the /api prefix.
// Keep this alias so existing invite links work while the frontend is updated.
app.use("/projects", projectRoutes);

// Health / Root Route
app.get("/", (_req, res) => {
  res.status(200).send("ZenSpace API Running");
});

app.head("/", (_req, res) => {
  res.status(200).end();
});

// JSON 404 response instead of Express HTML so clients can safely inspect errors.
app.use((_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ SERVER ERROR:", err);

  if (err.code === "P1001" || err.message?.includes("Can't reach database server")) {
    return res.status(503).json({
      error: "Database connection failed. The server might be waking up, please try again in 5-10 seconds.",
      code: "DB_CONNECTION_ERROR",
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Port Handling (Railway Safe)
const PORT = Number(process.env.PORT) || 4000;

console.log("ENV PORT:", process.env.PORT);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
