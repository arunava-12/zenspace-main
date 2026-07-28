import React, { useState } from "react";
import {
  Filter,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import SegmentedProgressBar from "../components/SegmentedProgressBar.tsx";

interface ProjectsProps {
  store: any;
}

const formatDate = (d: string | Date) => {
  const date = new Date(d);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Projects: React.FC<ProjectsProps> = ({ store }) => {
  const { projects = [], tasks = [], users = [], openProjectModal } = store || {};
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = projects.filter((p: any) => {
    const progress = store.getProjectProgress(p.id);
    const hasTasks = tasks.some((t: any) => t.projectId === p.id);

    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (filter === "Completed") matchesStatus = hasTasks && progress === 100;
    else if (filter === "Planning") matchesStatus = progress === 0;
    else if (filter === "Active") matchesStatus = progress > 0 && progress < 100;
    else if (filter !== "All") matchesStatus = p.status === filter;

    // Priority filter
    const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const MAX_VISIBLE_MEMBERS = 3;


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
            Projects
          </h1>
          <p className="text-zinc-500 mt-1 font-medium italic opacity-80">
            Manage and track your team's project progress.
          </p>
        </div>
        <button
          onClick={openProjectModal}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/25 active:scale-95 group/btn"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filters & Search - Glass Pill Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card !bg-opacity-30 p-2 rounded-2xl border-white/20">
        <div className="flex p-1 glass-inset rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {["All", "Active", "Planning", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === tab
                  ? "bg-white/80 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto px-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name......"
              className="w-full glass-inset !bg-white/5 py-2 pl-9 pr-4 text-sm rounded-xl outline-none border-transparent focus:border-blue-500/30 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 glass-inset hover:bg-white/20 dark:hover:bg-white/10 text-zinc-500 rounded-xl transition-colors ${showFilters ? "ring-2 ring-blue-500/50" : ""}`}
            >
              <Filter size={20} />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card p-4 rounded-2xl shadow-2xl z-50 border border-zinc-200 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filter by Priority</label>
                  <div className="grid grid-cols-1 gap-1">
                    {["All", "Low", "Medium", "High"].map(p => (
                      <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${priorityFilter === p ? "bg-blue-600 text-white" : "glass-inset hover:bg-zinc-100 dark:hover:bg-white/10"}`}
                      >
                        {p} Priority
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setFilter("All");
                    setPriorityFilter("All");
                    setSearchTerm("");
                  }}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          const lead = users.find((u: any) => u.id === project.leadId);
          const memberIds = project.memberIds || [];
          const membersToShow = memberIds.slice(0, MAX_VISIBLE_MEMBERS);
          const remainingCount = memberIds.length - MAX_VISIBLE_MEMBERS;

          return (
            <div
              key={project.id || index}
              className="glass-card group flex flex-col rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${
                      store.getProjectProgress(project.id) === 100 && tasks.some(t => t.projectId === project.id)
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : store.getProjectProgress(project.id) === 0
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {(project.name || "P").charAt(0)}
                  </div>

                  <button className="p-1 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg text-zinc-400 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded glass-inset ${
                      project.priority === "High"
                        ? "text-rose-600 dark:text-rose-400"
                        : project.priority === "Medium"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {project.priority} Priority
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded glass-inset ${
                      store.getProjectProgress(project.id) === 100 && tasks.some(t => t.projectId === project.id)
                        ? "text-emerald-600 dark:text-emerald-400"
                        : store.getProjectProgress(project.id) === 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {store.getProjectProgress(project.id) === 100 && tasks.some(t => t.projectId === project.id)
                      ? "Completed"
                      : store.getProjectProgress(project.id) === 0
                        ? "Planning"
                        : "Active"}
                  </span>

                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    <span>Progress</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {store.getProjectProgress(project.id)}%
                    </span>
                  </div>

                  {/* Dynamic progress bar with color based on completion */}
                  <SegmentedProgressBar
                    progress={store.getProjectProgress(project.id)}
                    segments={30}
                    height="h-7"
                  />

                  {/* Optional: Show task completion count */}
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {
                      store.tasks.filter(
                        (t: any) =>
                          t.projectId === project.id &&
                          (t.status.toLowerCase().replace(/[\s_]+/g, "") ===
                            "done" ||
                            t.status.toLowerCase().replace(/[\s_]+/g, "") ===
                              "completed"),
                      ).length
                    }{" "}
                    of{" "}
                    {
                      store.tasks.filter((t: any) => t.projectId === project.id)
                        .length
                    }{" "}
                    tasks completed
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 glass-inset !bg-transparent !border-x-0 !border-b-0 flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {membersToShow.map((id: string) => {
                    const member = users.find((u: any) => u.id === id);
                    return (
                      <img
                        key={id}
                        src={member?.avatar}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-sm"
                        title={member?.name}
                      />
                    );
                  })}
                  {remainingCount > 0 && (
                    <div className="w-8 h-8 rounded-full glass-inset flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800">
                      +{remainingCount}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">
                    {formatDate(project.endDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
