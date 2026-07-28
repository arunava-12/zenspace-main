import express from "express";
import prisma from "../prisma";

const router = express.Router();

// ==========================
// CREATE PROJECT
// ==========================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      leadId,
      priority,
      status,
      startDate,
      endDate,
      workspaceId,
    } = req.body;

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        leadId,
        priority,
        status,
        workspaceId,
        startDate: new Date(sy, sm - 1, sd),
        endDate: new Date(ey, em - 1, ed),

        // Add creator as OWNER
        users: {
          create: {
            userId: leadId,
            role: "OWNER",
          },
        },
      },
      include: {
        lead: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Project creation failed" });
  }
});

// ==========================
// GET ALL PROJECTS FOR USER
// ==========================
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const workspaceId = req.query.workspaceId as string;

    if (!userId || !workspaceId) {
      return res.status(400).json({ error: "Missing params" });
    }

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
        OR: [
          { leadId: userId },
          {
            users: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        lead: true,
        users: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ==========================
// VALIDATE INVITE LINK
// ==========================
router.get("/invite/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await prisma.projectInvite.findUnique({
      where: { token },
      include: {
        project: true,
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    if (!invite.isActive) {
      return res
        .status(400)
        .json({ error: "This invite link has been deactivated" });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: "This invite link has expired" });
    }

    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return res.status(400).json({ error: "Invite usage limit reached" });
    }

    res.json({
      project: invite.project,
      role: invite.role,
      usedCount: invite.usedCount,
      maxUses: invite.maxUses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate invite" });
  }
});

// ==========================
// JOIN PROJECT VIA INVITE LINK
// ==========================
router.post("/join/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;

    // Find the invite
    const invite = await prisma.projectInvite.findUnique({
      where: { token },
      include: {
        project: true,
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    // Check if invite is still valid
    if (!invite.isActive) {
      return res
        .status(400)
        .json({ error: "This invite link has been deactivated" });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: "This invite link has expired" });
    }

    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return res.status(400).json({
        error: "This invite link has reached its maximum usage limit",
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: invite.projectId,
        },
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "You are already a member of this project" });
    }

    // Add user to project
    const projectUser = await prisma.projectUser.create({
      data: {
        userId,
        projectId: invite.projectId,
        role: invite.role,
      },
      include: {
        user: true,
        project: true,
      },
    });

    await prisma.workspaceUser.upsert({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: invite.project.workspaceId,
        },
      },
      update: {},
      create: {
        userId: userId,
        workspaceId: invite.project.workspaceId,
      },
    });

    // Increment invite usage count
    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      project: projectUser.project,
      member: projectUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join project" });
  }
});

// ==========================
// GET SINGLE PROJECT DETAILS
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        lead: true,
        users: {
          include: {
            user: true,
          },
        },
        workspace: true,
        tasks: true,
        files: true,
        comments: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// ==========================
// DELETE PROJECT
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.project.deleteMany({
      where: { id },
    });

    if (result.count === 0) {
      return res.status(200).json({ success: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Project deletion failed" });
  }
});

// ==========================
// CREATE INVITE LINK
// ==========================
router.post("/:id/invites", async (req, res) => {
  try {
    const { id } = req.params;
    const { createdById, role = "MEMBER", expiresInDays, maxUses } = req.body;

    // Verify user has permission (is project owner or lead)
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        users: {
          where: {
            userId: createdById,
            role: "OWNER",
          },
        },
      },
    });

    if (
      !project ||
      (project.leadId !== createdById && project.users.length === 0)
    ) {
      return res.status(403).json({
        error: "Unauthorized: Only project owners can create invite links",
      });
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const invite = await prisma.projectInvite.create({
      data: {
        projectId: id,
        role,
        expiresAt,
        maxUses: maxUses || null,
        createdById,
      },
    });

    res.json(invite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create invite link" });
  }
});

// ==========================
// GET PROJECT INVITES
// ==========================
router.get("/:id/invites", async (req, res) => {
  try {
    const { id } = req.params;

    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
});

// ==========================
// DEACTIVATE INVITE LINK
// ==========================
router.delete("/invites/:inviteId", async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { userId } = req.body;

    // Verify user has permission
    const invite = await prisma.projectInvite.findUnique({
      where: { id: inviteId },
      include: {
        project: {
          include: {
            users: {
              where: {
                userId,
                role: "OWNER",
              },
            },
          },
        },
      },
    });

    if (
      !invite ||
      (invite.project.leadId !== userId && invite.project.users.length === 0)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.projectInvite.update({
      where: { id: inviteId },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate invite" });
  }
});

// ==========================
// REMOVE MEMBER FROM PROJECT
// ==========================
router.delete("/:projectId/members/:userId", async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { requesterId } = req.body;

    // Verify requester has permission (is owner)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        users: {
          where: {
            userId: requesterId,
            role: "OWNER",
          },
        },
      },
    });

    if (
      !project ||
      (project.leadId !== requesterId && project.users.length === 0)
    ) {
      return res.status(403).json({
        error: "Unauthorized: Only project owners can remove members",
      });
    }

    // Cannot remove project lead
    if (userId === project.leadId) {
      return res.status(400).json({ error: "Cannot remove project lead" });
    }

    await prisma.projectUser.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// ==========================
// UPDATE MEMBER ROLE
// ==========================
router.patch("/:projectId/members/:userId/role", async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { requesterId, role } = req.body;

    // Verify requester has permission (is owner)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        users: {
          where: {
            userId: requesterId,
            role: "OWNER",
          },
        },
      },
    });

    if (
      !project ||
      (project.leadId !== requesterId && project.users.length === 0)
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Only project owners can change roles" });
    }

    // Cannot change role of project lead
    if (userId === project.leadId) {
      return res
        .status(400)
        .json({ error: "Cannot change role of project lead" });
    }

    const updatedMember = await prisma.projectUser.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: { role },
      include: {
        user: true,
      },
    });

    res.json(updatedMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

// ==========================
// TEST ROUTE
// ==========================
router.get("/test-delete", (_req, res) => {
  res.json({ ok: true });
});

export default router;
