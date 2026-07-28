import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Users, AlertCircle } from "lucide-react";
import DotGrid from "../components/DotGrid";

interface JoinProjectProps {
  store: any;
}

const JoinProject: React.FC<JoinProjectProps> = ({ store }) => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentUser } = store;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  console.log("Invite token:", token);

  useEffect(() => {
    if (!token || !currentUser) return;

    const validateInvite = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/projects/invite/${token}`,
        );

        if (!res.ok) {
          throw new Error("Invalid invite link");
        }

        const data = await res.json();

        console.log("Invite validated:", data);

        setProjectInfo(data.project);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Invalid invite link");
        setLoading(false);
      }
    };

    validateInvite();
  }, [token, currentUser]);

  const handleJoinProject = async () => {
    if (!currentUser || !token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/join/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to join project");
      }

      const data = await response.json();

      setProjectInfo(data.project);
      setSuccess(true);
      setLoading(false);

      // Redirect to project after 2 seconds
      setTimeout(async () => {
        await Promise.all([
          store.fetchProjects(), // refresh projects list
          store.fetchTasks(),    // refresh tasks list
        ]);
        navigate(`/projects/${data.project.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to join project");
      setLoading(false);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: 0 }}>
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
        <div className="text-center space-y-4 relative z-10 w-full h-full flex flex-col items-center justify-center">
          <Loader2 size={48} className="animate-spin mx-auto text-blue-600" />
          <p className="text-zinc-600 dark:text-zinc-400 font-bold">
            Validating invite link...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: 0 }}>
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
        <div className="glass-card w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl p-12 text-center space-y-6 animate-in zoom-in duration-500 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              You're In! 🎉
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Successfully joined {projectInfo?.name}
            </p>
          </div>
          <div className="pt-4">
            <Loader2 size={24} className="animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-zinc-500 mt-2">
              Redirecting to project...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: 0 }}>
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
      <div className="glass-card w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-12 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Users size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter mb-2">
            Project Invitation
          </h1>
          <p className="text-blue-100 text-sm font-medium">
            You've been invited to join a project
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {error ? (
            <div className="space-y-6">
              <div className="glass-card bg-rose-500/5 border-rose-500/20 p-6 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-rose-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-bold text-rose-900 dark:text-rose-200 mb-1">
                      Unable to Join
                    </h3>
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoinProject}
                className="w-full py-3 glass-card hover:bg-white dark:hover:bg-white/5 rounded-2xl font-black transition-all active:scale-95"
              >
                Go to Projects
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="glass-inset p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Invited By
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                      {currentUser?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-bold text-sm">Project Owner</span>
                  </div>
                </div>

                <div className="glass-inset p-4 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                    What You'll Get
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Access to project tasks and files",
                      "Collaborate with team members",
                      "Receive project updates",
                      "Participate in discussions",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-600 flex-shrink-0"
                        />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleJoinProject}
                  disabled={joining}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {joining ? "Joining..." : "Join Project"}
                </button>

                <button
                  onClick={() => navigate("/projects")}
                  disabled={joining}
                  className="w-full py-3 glass-card hover:bg-white dark:hover:bg-white/5 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinProject;
