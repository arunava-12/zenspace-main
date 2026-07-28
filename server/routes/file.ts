import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// ==========================
// GET FILES FOR PROJECT
// ==========================
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = await prisma.fileAsset.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    // Map uploadedById to uploadedBy to match frontend types
    const formattedFiles = files.map((f: any) => ({
      ...f,
      uploadedBy: f.uploadedById,
    }));

    res.json(formattedFiles);
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// ==========================
// CREATE FILE METADATA
// ==========================
router.post("/", async (req, res) => {
  try {
    const { name, size, type, url, projectId, uploadedById, taskId } = req.body;

    if (!name || !projectId || !uploadedById) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const file = await prisma.fileAsset.create({
      data: {
        name,
        size,
        type,
        url: url || "", // In a real app, this would be the S3/Cloudinary URL
        projectId,
        uploadedById,
        taskId,
      },
    });

    res.status(201).json({
      ...file,
      uploadedBy: file.uploadedById,
    });
  } catch (error) {
    console.error("Create file error:", error);
    res.status(500).json({ error: "Failed to save file metadata" });
  }
});

// ==========================
// DELETE FILE
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fileAsset.delete({ where: { id } });
    res.json({ success: true, message: "File metadata deleted" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
