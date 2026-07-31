import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "../types";

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "https://zenspace-backend-hsfl.onrender.com/api";
  
const FALLBACK_USER = {
  id: "fallback-user",
  name: "Arunava",
  email: "arunavacr7@gmail.com",
  avatar: "",
  role: "Admin" as const,
};

const FALLBACK_PASSWORD = "Arunava@12";

const isFallbackCredentials = (email: string, password: string) => {
  return email === FALLBACK_USER.email && password === FALLBACK_PASSWORD;
};

export function useStore() {
  // Authentication is bootstrapped from the server. Start as `false` and set
  // `bootstrapped` once the initial fetch completes so UI components that
  // depend on `currentUser` won't crash during the async load.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("userId");
  });

  const [bootstrapped, setBootstrapped] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dark mode only — light mode removed
  const [darkMode] = useState(true);
  const setDarkMode = (_val: boolean) => {}; // no-op kept for API compat

  const updateProfile = (name: string, email: string) => {
    setCurrentUser((prev) => (prev ? { ...prev, name, email } : prev));
  };

  const updateAvatar = (avatar: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, avatar };
      localStorage.setItem("zenspace_user", JSON.stringify(updated));
      return updated;
    });
  };

  const fallbackLogin = () => {
    const user = FALLBACK_USER;
    localStorage.setItem("userId", user.id);
    localStorage.setItem("zenspace_user", JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    return user;
  };

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Array<any>>(() => {
    // basic default workspace for new installs
    const defaultWs = {
      id: "demo-workspace",
      name: "Demo's Workspace",
      ownerId: "",
    };
    return [defaultWs];
  });

  const [activeWorkspace, setActiveWorkspace] = useState<any>(() => {
    const saved = localStorage.getItem("activeWorkspace");

    if (saved) {
      return JSON.parse(saved);
    }

    return { id: "demo-workspace", name: "Demo's Workspace" };
  });

  const setActiveWorkspaceId = (id: string) => {
    const ws = workspaces.find((w) => w.id === id);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem("activeWorkspace", JSON.stringify(ws));
    }
  };

  // 🔥 UPDATED: Make updateWorkspace async and persist to backend
  const updateWorkspace = async (id: string, name: string) => {
    try {
      // Update backend first
      const response = await fetch(`${API_BASE}/workspace/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        console.error("Failed to update workspace in backend");
        return false;
      }

      // Update local state
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.id === id ? { ...ws, name } : ws)),
      );

      // Update active workspace if it's the one being edited
      if (activeWorkspace?.id === id) {
        const updatedWorkspace = { ...activeWorkspace, name };
        setActiveWorkspace(updatedWorkspace);
        // 🔥 CRITICAL: Update localStorage so it persists across refreshes
        localStorage.setItem(
          "activeWorkspace",
          JSON.stringify(updatedWorkspace),
        );
      }

      return true;
    } catch (err) {
      console.error("Error updating workspace:", err);
      return false;
    }
  };

  // Simple in-memory collections used across the UI
  const [projects, setProjects] = useState<Array<any>>([]);
  const [tasks, setTasks] = useState<Array<any>>([]);
  const [users, setUsers] = useState<Array<User>>(() =>
    currentUser ? [currentUser] : [],
  );
  // Keep users array in sync with logged-in user
  useEffect(() => {
    if (currentUser) {
      setUsers((prev) => {
        if (!currentUser) return prev;
        return prev.some((u) => u.id === currentUser.id)
          ? prev
          : [currentUser, ...prev];
      });
    }
  }, [currentUser]);
  const [files, setFiles] = useState<Array<any>>([]);
  const [comments, setComments] = useState<Array<any>>([]);

  // Modals / UI state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceModalType, setWorkspaceModalType] = useState<
    "create" | "join" | undefined
  >(undefined);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // 🔥 FIX: Add ref to track ongoing project creation
  const isCreatingProjectRef = useRef(false);

  const openWorkspaceModal = (type: "create" | "join" = "create") => {
    setWorkspaceModalType(type);
    setIsWorkspaceModalOpen(true);
  };
  const closeWorkspaceModal = () => setIsWorkspaceModalOpen(false);

  const openTaskModal = (task?: any) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };
  const closeTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const openProjectModal = () => setIsProjectModalOpen(true);
  const closeProjectModal = () => setIsProjectModalOpen(false);
  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);

  // ============ FETCH TASKS ============
  const fetchTasks = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const workspaceQuery = activeWorkspace?.id ? `&workspaceId=${activeWorkspace.id}` : "";
      const res = await fetch(`${API_BASE}/tasks?userId=${currentUser.id}${workspaceQuery}`, {
        // 🔥 FIX: Bypass cache to ensure fresh data
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) {
        setTasks([]);
        return;
      }

      const data = await res.json();
      console.log("✅ Fetched tasks:", data); // Debug log
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch tasks failed", err);
      setTasks([]);
    }
  }, [currentUser?.id]);

  // ============ ADD TASK (with API) ============
  const addTask = async (taskData: any) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);

      return newTask;
    } catch (err) {
      console.error("Add task failed", err);
      throw err;
    }
  };

  // ============ UPDATE TASK (with API) ============
  const updateTask = async (taskData: any) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      );

      return updatedTask;
    } catch (err) {
      console.error("Update task failed", err);
      throw err;
    }
  };

  // ============ DELETE TASK (with API) ============
  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete task failed", err);
      throw err;
    }
  };

  const fetchProjects = async () => {
    if (!activeWorkspace?.id || !currentUser?.id) return;

    try {
      const res = await fetch(
        `${API_BASE}/projects?userId=${currentUser.id}&workspaceId=${activeWorkspace.id}`,
      );

      if (!res.ok) {
        setProjects([]);
        return;
      }

      const data = await res.json();

      const normalized = Array.isArray(data)
        ? data.map((p: any) => ({
            ...p,
            memberIds: p.users?.map((u: any) => u.userId) || [],
          }))
        : [];

      setProjects(normalized);

      // 🔥 Sync users from project members
      // 🔥 Sync users from project members
      const projectUsers: User[] = normalized.flatMap(
        (p: any) => p.users?.map((u: any) => u.user as User) || [],
      );

      setUsers((prev: User[]) => {
        const map = new Map<string, User>(prev.map((u) => [u.id, u]));

        projectUsers.forEach((u) => {
          map.set(u.id, u);
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error("Fetch projects failed");
      setProjects([]);
    }
  };

  // 🔥 FIX: Prevent double project creation
  const addProject = async (project: any) => {
    // Prevent duplicate calls
    if (isCreatingProjectRef.current) {
      console.log("🚫 Project creation already in progress, skipping...");
      return;
    }

    try {
      isCreatingProjectRef.current = true;

      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          workspaceId: activeWorkspace.id,
        }),
      });

      if (!res.ok) throw new Error("Project creation failed");

      const newProject = await res.json();

      // ✅ Add the project directly to state instead of refetching
      setProjects((prev) => [newProject, ...prev]);
    } catch (err) {
      console.error(err);
      throw err; // Re-throw so modal can handle error
    } finally {
      // Reset the flag after a short delay to allow for the API call to complete
      setTimeout(() => {
        isCreatingProjectRef.current = false;
      }, 500);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Server delete failed");
      }

      // Remove project
      setProjects((prev) => prev.filter((p) => p.id !== id));

      // Remove all related data
      setTasks((prev) => prev.filter((t) => t.projectId !== id));
      setFiles((prev) => prev.filter((f) => f.projectId !== id));
      setComments((prev) => prev.filter((c) => c.projectId !== id));
    } catch (err) {
      console.error("Delete project failed", err);
      alert("Failed to delete project from server");
    }
  };

  const addProjectMember = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              memberIds: Array.from(new Set([...(p.memberIds || []), userId])),
            }
          : p,
      ),
    );
  };

  const addFile = async (fileData: any) => {
    try {
      const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      });

      if (!res.ok) throw new Error("Failed to save file metadata");

      const newFile = await res.json();
      setFiles((prev) => [newFile, ...prev]);
      return newFile;
    } catch (err) {
      console.error("Add file failed", err);
      throw err;
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete file");

      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete file failed", err);
    }
  };

  const fetchFiles = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`${API_BASE}/files/project/${projectId}`);
      if (!res.ok) return;

      const data = await res.json();
      setFiles((prev) => {
        // Merge with existing but avoid duplicates
        const existingIds = new Set(prev.map((f) => f.id));
        const newFiles = data.filter((f: any) => !existingIds.has(f.id));
        return [...prev, ...newFiles];
      });
    } catch (err) {
      console.error("Fetch files failed", err);
    }
  }, []);

  const fetchComments = useCallback(async (projectId?: string, taskId?: string) => {
    if (!currentUser?.id) return;

    try {
      let url = `${API_BASE}/comments`;
      if (projectId) {
        url += `/project/${projectId}`;
      } else if (taskId) {
        url += `/task/${taskId}`;
      } else {
        return; // Need at least one
      }

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      setComments((prev) => {
        // Merge new comments with existing ones, avoiding duplicates
        const existingIds = new Set(prev.map((c) => c.id));
        const newComments = data.filter((c: any) => !existingIds.has(c.id));
        return [...prev, ...newComments];
      });
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  }, [currentUser?.id]);

  const addComment = async (commentData: any) => {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error("🔥 Add comment failed:", err);
      // Optional: set global error to show toast or alert
      setError(err instanceof Error ? err.message : "Failed to post message. Please check the server.");
      throw err;
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/workspaces`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            ownerId: currentUser.id,
          }),
        },
      );

      const data = await res.json();

      setWorkspaces((prev) => [data, ...prev]);
      setActiveWorkspace(data);
      localStorage.setItem("activeWorkspace", JSON.stringify(data));

      return data;
    } catch (err) {
      console.error("Workspace create failed", err);
    }
  };

  const joinWorkspace = (joinCode: string) => {
    // simple fake join that creates a workspace with the provided code
    const ws = createWorkspace(joinCode);
    return ws;
  };

  // ---------------- THEME (dark only) ----------------
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("zenspace_theme", "dark");
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchTasks(); // 🔥 ADD: Fetch tasks when workspace/user changes
  }, [activeWorkspace?.id, currentUser?.id]);

  // ---------------- FETCH CURRENT USER ----------------
  useEffect(() => {
    // 1️⃣ FIRST: Try localStorage
    const savedUser = localStorage.getItem("zenspace_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setBootstrapped(true);
        return;
      }

      if (userId === FALLBACK_USER.id) {
        setCurrentUser(FALLBACK_USER);
        setIsAuthenticated(true);
        setBootstrapped(true);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me/${userId}`);
        if (!res.ok) {
          localStorage.removeItem("userId");
          setBootstrapped(true);
          return;
        }

        const data = await res.json();

        // 2️⃣ THEN: Override with server data
        setCurrentUser(data.user);

        // Optional but recommended → keep localStorage updated
        localStorage.setItem("zenspace_user", JSON.stringify(data.user));

        setIsAuthenticated(true);
      } catch (err) {
        const parsedSavedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedSavedUser?.email === FALLBACK_USER.email) {
          setIsAuthenticated(true);
          setBootstrapped(true);
          return;
        }

        localStorage.removeItem("userId");
        setIsAuthenticated(false);
      } finally {
        setBootstrapped(true);
      }
    };

    fetchUser();
  }, []);

  // ---------------- FETCH WORKSPACES ----------------
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!currentUser?.id) return;

      try {
        const res = await fetch(
          `${API_BASE}/workspaces?userId=${currentUser.id}`,
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setWorkspaces(data);

          // 🔥 ADDED: Sync activeWorkspace with fresh data from server
          const savedActiveWs = localStorage.getItem("activeWorkspace");
          if (savedActiveWs) {
            const parsedActiveWs = JSON.parse(savedActiveWs);
            // Find the matching workspace from server data
            const freshWorkspace = data.find(
              (ws: any) => ws.id === parsedActiveWs.id,
            );
            if (freshWorkspace) {
              // Update both state and localStorage with fresh data
              setActiveWorkspace(freshWorkspace);
              localStorage.setItem(
                "activeWorkspace",
                JSON.stringify(freshWorkspace),
              );
            }
          }
        } else {
          setWorkspaces([]);
        }
      } catch (err) {
        console.error("Fetch workspaces failed");
      }
    };

    fetchWorkspaces();
  }, [currentUser]);

  const deleteWorkspace = async (id: string) => {
    await fetch(`${API_BASE}/workspaces/${id}`, {
      method: "DELETE",
    });

    setActiveWorkspace((prev) => {
      const remaining = workspaces.filter((w) => w.id !== id);
      return remaining[0] || null;
    });

    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  };

  // ---------------- LOGIN ----------------
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (isFallbackCredentials(email, password) && [502, 503, 504].includes(res.status)) {
          fallbackLogin();
          return;
        }
        const err = await res.json();
        throw new APIError(err.error || "Request failed");
      }
      const data = await res.json();

      localStorage.setItem("userId", data.user.id);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      if (isFallbackCredentials(email, password)) {
        fallbackLogin();
        return;
      }
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------- SIGNUP ----------------
  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 503) {
            throw new APIError("The database is currently warming up. Please wait a few seconds and try again.");
          }
          throw new APIError(data.error || "Signup failed");
        }

        localStorage.setItem("userId", data.user.id);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ---------------- LOGOUT ----------------
  const logout = useCallback(() => {
    localStorage.removeItem("userId");
    setCurrentUser(null);
    setUsers([]); // <-- ADD THIS LINE
    setIsAuthenticated(false);
  }, []);

  // -------- PROGRESS --------
  const getProjectProgress = (projectId: string) => {
    // Get all tasks for this project
    const projectTasks = tasks.filter((t) => t.projectId === projectId);

    // Handle edge case: no tasks = 0%
    if (projectTasks.length === 0) return 0;

    // Count completed tasks
    const completedTasks = projectTasks.filter((t) => {
      const normalizedStatus = t.status.toLowerCase().replace(/[\s_]+/g, "");
      return normalizedStatus === "done" || normalizedStatus === "completed";
    }).length;

    // Calculate percentage
    const progress = Math.round((completedTasks / projectTasks.length) * 100);

    return progress;
  };

  return {
    // -------- AUTH --------
    isAuthenticated,
    bootstrapped,
    login,
    signup,
    logout,
    currentUser,

    // -------- THEME --------
    darkMode,
    setDarkMode,

    // -------- PROFILE --------
    updateProfile,
    updateAvatar,

    // -------- WORKSPACES --------
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    updateWorkspace,
    createWorkspace,
    joinWorkspace,
    deleteWorkspace,

    // -------- PROJECTS --------
    projects,
    addProject,
    deleteProject,
    addProjectMember,
    fetchProjects,

    // -------- TASKS --------
    tasks,
    addTask,
    updateTask,
    deleteTask,
    fetchTasks, // 🔥 ADD: Expose fetchTasks so pages can manually refresh
    getProjectProgress,

    // -------- USERS --------
    users,

    // -------- FILES / COMMENTS --------
    files,
    addFile,
    deleteFile,
    fetchFiles,
    comments,
    addComment,
    fetchComments,

    // -------- MODALS --------
    isTaskModalOpen,
    editingTask,
    openTaskModal,
    closeTaskModal,

    isProjectModalOpen,
    openProjectModal,
    closeProjectModal,

    isWorkspaceModalOpen,
    openWorkspaceModal,
    closeWorkspaceModal,
    workspaceModalType,

    isChatbotOpen,
    openChatbot,
    closeChatbot,

    // -------- LOADING / ERROR --------
    isLoading,
    error,
    setError,
  };
}
