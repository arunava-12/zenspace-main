import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  Trash2,
  Edit2,
  CheckCircle,
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Task, Priority, TaskType, TaskStatus } from "../types.ts";
import DotGrid from "../components/DotGrid";
import StatsCard from "../components/StatsCard.tsx";

interface TasksProps {
  store: any;
}

const Tasks: React.FC<TasksProps> = ({ store }) => {
  const {
    tasks = [],
    projects = [],
    users = [],
    addTask,
    updateTask,
    deleteTask,
    fetchTasks, // 🔥 ADD: Get fetchTasks from store
    currentUser = { id: "" },
  } = store || {};
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 ADD: Loading state
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // 🔥 ADD: Refetch tasks when component mounts
  useEffect(() => {
    if (fetchTasks && currentUser?.id) {
      fetchTasks();
    }
  }, [currentUser?.id]);
  // ✅ Empty array = run only once on mount

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: projects?.[0]?.id || "",
    priority: "Medium" as Priority,
    type: "Task" as TaskType,
    status: "Todo" as TaskStatus,
    assigneeId: currentUser.id,
    dueDate: new Date().toISOString().split("T")[0],
  });

  const handleOpenModal = (task?: Task, defaultStatus?: TaskStatus) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        priority: task.priority,
        type: task.type,
        status: task.status,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        projectId: projects[0]?.id || "",
        priority: "Medium",
        type: "Task",
        status: defaultStatus || "Todo",
        assigneeId: currentUser.id,
        dueDate: new Date().toISOString().split("T")[0],
      });
    }
    setShowModal(true);
  };

  // 🔥 FIX: Make handler async and handle errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTask) {
        await updateTask({ ...editingTask, ...formData });
      } else {
        await addTask(formData);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Task operation failed:", err);
      alert("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
    // Add a slight delay to allow the ghost image to be created before styling changes
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = "0.4";
      target.style.transform = "scale(0.95)";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (status: string) => {
    setDragOverStatus(status);
  };

  // 🔥 FIX: Make drop handler async
  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task && task.status !== newStatus) {
      try {
        await updateTask({ ...task, status: newStatus });
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    }
  };

  // 🔥 FIX: Make delete handler async
  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const normalizeStatus = (s?: string) =>
    (s || "").toLowerCase().replace(/[\s_]+/g, "");

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === "All" || task.projectId === projectFilter;
    const matchesPriority = priorityFilter === "All" || task.priority?.toUpperCase() === priorityFilter.toUpperCase();
    
    return matchesSearch && matchesProject && matchesPriority;
  });

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: -1 }}>
        <DotGrid
          dotSize={5}
          gap={15}
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="glass-card p-8 rounded-[2.5rem] border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            Tasks
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Manage and organize your work across all projects.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/25 active:scale-95 group/btn"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Task</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks across workspace..."
            className="w-full glass-inset !border-transparent py-3 pl-12 pr-4 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 glass-card hover:bg-white/40 dark:hover:bg-white/10 rounded-2xl text-sm font-bold transition-all ${showFilters ? "ring-2 ring-blue-500/50" : ""}`}
          >
            <Filter size={18} /> 
            <span>Filters</span>
            {(projectFilter !== "All" || priorityFilter !== "All") && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-3 w-72 glass-card p-6 rounded-[2.5rem] shadow-2xl z-[60] border border-zinc-200 dark:border-white/10 space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Project</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  <button
                    onClick={() => setProjectFilter("All")}
                    className={`text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${projectFilter === "All" ? "bg-blue-600 text-white" : "glass-inset hover:bg-zinc-100 dark:hover:bg-white/10"}`}
                  >
                    All Projects
                  </button>
                  {projects.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setProjectFilter(p.id)}
                      className={`text-left px-4 py-2 rounded-xl text-xs font-bold transition-all truncate ${projectFilter === p.id ? "bg-blue-600 text-white" : "glass-inset hover:bg-zinc-100 dark:hover:bg-white/10"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "Low", "Medium", "High"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${priorityFilter === p ? "bg-blue-600 text-white border-blue-600" : "glass-inset hover:bg-zinc-100 dark:hover:bg-white/10 border-transparent"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setProjectFilter("All");
                  setPriorityFilter("All");
                  setSearchTerm("");
                }}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Todo", "In Progress", "Done"].map((status) => {
          const statusCount = filteredTasks.filter(
            (t: any) => normalizeStatus(t.status) === normalizeStatus(status),
          ).length;

          return (
          <div
            key={status}
            className={`flex flex-col gap-6 p-2 rounded-[3rem] transition-all duration-300 -m-2 ${
              dragOverStatus === status
                ? "bg-blue-500/5 ring-2 ring-inset ring-blue-500/20 shadow-inner"
                : "bg-transparent"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(status)}
            onDrop={(e) => handleDrop(e, status as TaskStatus)}
          >
            <div className="pointer-events-none sm:pointer-events-auto">
              <StatsCard
                label={status}
                value={statusCount}
                icon={status === "Todo" ? Clock : status === "In Progress" ? Zap : CheckCircle2}
                color={status === "Todo" ? "amber" : status === "In Progress" ? "blue" : "emerald"}
              />
            </div>

            <div className="space-y-3 min-h-[500px] flex-1 px-1">
              {filteredTasks
                .filter(
                  (t: any) =>
                    normalizeStatus(t.status) === normalizeStatus(status),
                )
                .map((task: any) => {
                  const project = projects.find(
                    (p: any) => p.id === task.projectId,
                  );
                  const assignee = users.find(
                    (u: any) => u.id === task.assigneeId,
                  );
                  return (
                    <div
                      key={task.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="glass-card p-5 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group relative cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded-lg border border-blue-500/10">
                          {project?.name || "Unassigned"}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(task)}
                            className="p-1.5 hover:bg-blue-500/10 text-blue-600 rounded-lg"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-600 rounded-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold mb-1 tracking-tight">
                        {task.title}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 font-medium leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                          <Calendar size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                        <img
                          src={assignee?.avatar}
                          className="w-6 h-6 rounded-full border border-white dark:border-zinc-800 shadow-sm"
                          title={assignee?.name}
                        />
                      </div>
                    </div>
                  );
                })}

              <button
                onClick={() => handleOpenModal(undefined, status as TaskStatus)}
                className="w-full py-4 glass-card border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2rem] text-zinc-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-white/5 dark:hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <Plus
                  size={14}
                  className="group-hover:rotate-90 transition-transform"
                />
                Add Task
              </button>
            </div>
          </div>
        )})}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl p-10 space-y-8 animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tighter">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                    Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Task title"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Details about the task"
                    rows={3}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Project
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) =>
                        setFormData({ ...formData, projectId: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-3.5 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none"
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as Priority,
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-3.5 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Assignee
                    </label>
                    <select
                      value={formData.assigneeId}
                      onChange={(e) =>
                        setFormData({ ...formData, assigneeId: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-3.5 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none"
                    >
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-3.5 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-white/5 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-4 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm font-black text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingTask
                      ? "Update Task"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
