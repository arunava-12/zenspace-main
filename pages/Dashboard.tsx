import React from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatsCard from "../components/StatsCard.tsx";
import DotGrid from "../components/DotGrid";
import SegmentedProgressBar from "../components/SegmentedProgressBar.tsx";

interface DashboardProps {
  store: any;
}

const Dashboard: React.FC<DashboardProps> = ({ store }) => {
  const {
    projects = [],
    tasks = [],
    currentUser = { id: "", name: "" },
    openProjectModal,
    openChatbot,
    users = [],
    activeWorkspace,
  } = store || {};

  const navigate = useNavigate();

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  }, []);

  const randomQuote = React.useMemo(() => {
    const quotes = [
      "Everything looks smooth in",
      "Great progress awaits in",
      "Let's crush some goals in",
      "Your productivity is peaking in",
      "Stay focused and inspired in",
      "The momentum is building in",
      "Success is brewing in",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  const totalProjects = projects.length;
  const doneTasksCount = tasks.filter((t: any) => {
    const s = (t.status || "").toLowerCase();
    return s === "done" || s === "completed";
  }).length;
  
  const myTasks = tasks.filter((t: any) => t.assigneeId === currentUser?.id);
  
  const criticalTasksCount = tasks.filter((t: any) => {
    const p = (t.priority || "").toLowerCase();
    const s = (t.status || "").toLowerCase();
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
    return (p === "high" || isOverdue) && s !== "done" && s !== "completed";
  }).length;



  return (
    <div className="space-y-10 pb-16 relative">
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
      {/* Welcome Section */}
      <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-10 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 via-transparent to-brand-400/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-brand-600 flex items-center justify-center text-white shadow-brand animate-float">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-display font-black tracking-tighter text-surface-900 dark:text-white leading-none">
                {greeting}, {(currentUser?.name || "User").split(" ")[0]}
              </h1>

              <p className="text-surface-500 font-medium pl-1 text-xl mt-1">
                {randomQuote}{" "}
                <span className="text-brand-500 font-black">
                  {activeWorkspace?.name || "Workspace"}
                </span>{" "}
                today.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button
            onClick={openProjectModal}
            className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-500 text-white px-10 py-5 rounded-2xl text-sm font-black transition-all shadow-xl shadow-brand/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Active Projects"
          value={totalProjects}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          label="Done Tasks"
          value={doneTasksCount}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          label="Your Queue"
          value={myTasks.length}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          label="Critical"
          value={criticalTasksCount}
          icon={AlertCircle}
          color="rose"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-premium rounded-[2.5rem] border border-surface-200 dark:border-white/5 overflow-hidden shadow-premium transition-all hover:shadow-2xl">
            <div className="p-10 border-b border-surface-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                  <TrendingUp size={24} />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  Active Projects
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-brand-500 hover:text-brand-400 text-sm font-black uppercase tracking-widest inline-flex items-center gap-2 transition-all hover:gap-3"
              >
                Full View <ArrowRight size={16} />
              </Link>
            </div>
            <div className="divide-y divide-surface-100 dark:divide-white/5">
              {projects.slice(0, 3).map((project: any) => (
                <div
                  key={project.id}
                  className="p-10 hover:bg-brand-500/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-2xl font-display font-black text-surface-900 dark:text-white group-hover:text-brand-500 transition-colors tracking-tighter"
                      >
                        {project.name}
                      </Link>
                      <p className="text-base text-surface-500 font-medium line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border ${
                        project.priority === "High"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : project.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-surface-500/10 text-surface-500 border-surface-500/20"
                      }`}
                    >
                      {project.priority}
                    </span>
                  </div>
                  <div className="mt-8 flex items-center gap-8">
                    <SegmentedProgressBar 
                      progress={store.getProjectProgress(project.id)} 
                      segments={40}
                      className="flex-1"
                      height="h-10"
                    />
                    <span className="text-lg font-black text-brand-500 w-12 text-right">
                      {store.getProjectProgress(project.id)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="group relative glass-premium rounded-[3rem] p-12 text-surface-900 dark:text-white overflow-hidden shadow-premium transition-all hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-purple-600/10 opacity-50"></div>
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
              <Sparkles size={160} />
            </div>

            <div className="relative z-10 max-w-lg space-y-8">
              <div className="bg-brand-600 w-fit p-4 rounded-2xl shadow-brand text-white animate-pulse-glow">
                <Zap size={28} fill="currentColor" />
              </div>
              <h2 className="text-4xl font-display font-black tracking-tighter">
                Meet ZenAI.
              </h2>
              <p className="text-surface-500 dark:text-surface-400 font-medium text-xl leading-relaxed">
                Your team's intelligence layer. Generate roadmaps, brainstorm
                tasks, and summarize chaos into clarity.
              </p>
              <button
                onClick={openChatbot}
                className="bg-brand-600 text-white hover:bg-brand-500 px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.03] active:scale-95 shadow-brand text-lg"
              >
                Activate Assistant
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="glass-premium rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col transition-all hover:shadow-2xl">
            <div className="p-10 border-b border-surface-200 dark:border-white/5 flex items-center justify-between">
              <h2 className="font-display font-black text-2xl tracking-tighter text-surface-900 dark:text-white">Your Queue</h2>
              <span className="bg-brand-600 text-white text-[12px] px-4 py-1.5 rounded-full font-black shadow-brand">
                {myTasks.length}
              </span>
            </div>
            <div className="flex-1 p-8 space-y-6 max-h-[520px] overflow-y-auto custom-scrollbar">
              {myTasks.length === 0 ? (
                <div className="py-24 text-center space-y-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-surface-100 dark:bg-white/5 mx-auto flex items-center justify-center text-emerald-500 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <p className="text-surface-500 font-black uppercase tracking-widest text-xs">Clear schedule!</p>
                </div>
              ) : (
                myTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-surface-100 dark:border-white/5 hover:border-brand-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-brand/5 active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`mt-2 w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                          task.status === "Done"
                            ? "bg-emerald-500"
                            : task.status === "In Progress"
                              ? "bg-brand-500 animate-pulse"
                              : "bg-surface-300 dark:bg-surface-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-lg font-bold tracking-tight truncate transition-colors ${task.status === "Done" ? "line-through text-surface-400" : "text-surface-900 dark:text-white group-hover:text-brand-500"}`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Clock size={14} className="text-surface-400" />
                          <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.15em]">
                            {task.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-8 border-t border-surface-200 dark:border-white/5 bg-surface-50/50 dark:bg-white/[0.02]">
              <button
                onClick={() => navigate("/tasks")}
                className="w-full py-4 text-sm font-black uppercase tracking-widest text-brand-500 hover:bg-brand-500/10 rounded-2xl transition-all"
              >
                Go to Workspace
              </button>
            </div>
          </div>

          <div className="glass-premium rounded-[2.5rem] shadow-premium p-10 space-y-10 transition-all hover:shadow-2xl">
            <h2 className="font-display font-black text-2xl tracking-tighter text-surface-900 dark:text-white">Active Squad</h2>
            <div className="space-y-8">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        className="w-14 h-14 rounded-[1.25rem] border-2 border-white dark:border-surface-800 shadow-premium group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                        alt=""
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-surface-950 shadow-sm"></div>
                    </div>
                    <div>
                      <p className="text-base font-bold text-surface-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-brand-500 font-black uppercase tracking-[0.2em] opacity-80">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button className="p-3 text-surface-300 hover:text-brand-500 bg-brand-500/0 hover:bg-brand-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/team")}
              className="w-full py-5 bg-brand-600 dark:bg-white text-white dark:text-surface-950 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-brand"
            >
              Team Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
