import express from "express";
import prisma from "../prisma";

const router = express.Router();

// ==========================
// CREATE COMMENT
// ==========================
router.post("/", async (req, res) => {
  try {
    const { content, userId, projectId, taskId } = req.body;
    
    console.log("📝 New comment request:", { content, userId, projectId, taskId });

    if (!content || !userId) {
      console.log("❌ Missing fields:", { content, userId });
      return res.status(400).json({ error: "Missing required content or userId" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
      },
    });

    console.log("✅ Comment created:", comment.id);
    res.json(comment);
  } catch (err: any) {
    console.error("❌ Create comment error details:", err);
    res.status(500).json({ 
      error: "Failed to create comment", 
      details: err.message,
      code: err.code 
    });
  }
});

// ==========================
// GET COMMENTS FOR PROJECT
// ==========================
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { projectId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(comments);
  } catch (err) {
    console.error("Fetch project comments error:", err);
    res.status(500).json({ error: "Failed to fetch project comments" });
  }
});

// ==========================
// GET COMMENTS FOR TASK
// ==========================
router.get("/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(comments);
  } catch (err) {
    console.error("Fetch task comments error:", err);
    res.status(500).json({ error: "Failed to fetch task comments" });
  }
});

export default router;
