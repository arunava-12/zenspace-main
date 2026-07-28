import React, { useState, useEffect } from "react";
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Users,
  Shield,
  Trash2,
  Calendar,
  Hash,
  RefreshCw,
  ExternalLink,
  Crown,
  UserCheck,
} from "lucide-react";
import { ProjectInvite, ProjectRole } from "../types";

interface ShareProjectModalProps {
  projectId: string;
  projectName: string;
  currentUserId: string;
  onClose: () => void;
}

const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  projectId,
  projectName,
  currentUserId,
  onClose,
}) => {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("MEMBER");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [maxUses, setMaxUses] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/invites`
      );
      const data = await response.json();
      setInvites(data);
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInviteLink = async () => {
    setCreating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/invites`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            createdById: currentUserId,
            role: selectedRole,
            expiresInDays: expiresInDays || undefined,
            maxUses: maxUses || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invite");
      }

      const newInvite = await response.json();
      setInvites([newInvite, ...invites]);
      
      // Reset form
      setSelectedRole("MEMBER");
      setExpiresInDays(null);
      setMaxUses(null);
    } catch (error: any) {
      alert(error.message || "Failed to create invite link");
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const deactivateInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to deactivate this invite link?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/invites/${inviteId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deactivate invite");
      }

      setInvites(
        invites.map((inv) =>
          inv.id === inviteId ? { ...inv, isActive: false } : inv
        )
      );
    } catch (error) {
      alert("Failed to deactivate invite link");
    }
  };

  const isExpired = (invite: ProjectInvite) => {
    return invite.expiresAt && new Date(invite.expiresAt) < new Date();
  };

  const isMaxUsesReached = (invite: ProjectInvite) => {
    return invite.maxUses !== null && invite.usedCount >= invite.maxUses;
  };

  const getInviteStatus = (invite: ProjectInvite) => {
    if (!invite.isActive) return { label: "Deactivated", color: "zinc" };
    if (isExpired(invite)) return { label: "Expired", color: "rose" };
    if (isMaxUsesReached(invite)) return { label: "Max Uses", color: "amber" };
    return { label: "Active", color: "emerald" };
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 dark:border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">
                  Share Project
                </h2>
              </div>
              <p className="text-sm text-zinc-500 font-medium">
                Invite others to collaborate on "{projectName}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Create New Invite */}
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <LinkIcon size={14} /> Create Invite Link
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                className="w-full glass-inset py-2.5 px-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="MEMBER">Member</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Expires In (Days)
              </label>
              <input
                type="number"
                value={expiresInDays || ""}
                onChange={(e) =>
                  setExpiresInDays(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Never"
                className="w-full glass-inset py-2.5 px-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                min="1"
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Max Uses
              </label>
              <input
                type="number"
                value={maxUses || ""}
                onChange={(e) =>
                  setMaxUses(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Unlimited"
                className="w-full glass-inset py-2.5 px-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={createInviteLink}
            disabled={creating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <LinkIcon size={16} />
                Generate Invite Link
              </>
            )}
          </button>
        </div>

        {/* Existing Invites */}
        <div className="flex-1 overflow-y-auto p-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <Shield size={14} /> Active Invite Links
          </h3>

          {loading ? (
            <div className="text-center py-8 text-zinc-500">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Loading invites...</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl border-dashed border-2">
              <LinkIcon size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-500">No invite links created yet</p>
              <p className="text-xs text-zinc-400 mt-1">
                Create your first invite link above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => {
                const status = getInviteStatus(invite);
                const inviteUrl = `${window.location.origin}/join/${invite.token}`;

                return (
                  <div
                    key={invite.id}
                    className={`glass-card p-4 rounded-2xl border transition-all ${
                      invite.isActive && !isExpired(invite) && !isMaxUsesReached(invite)
                        ? "border-zinc-200 dark:border-white/5 hover:shadow-lg"
                        : "border-zinc-100 dark:border-white/[0.02] opacity-60"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {invite.role === "OWNER" ? (
                            <Crown size={16} className="text-amber-600" />
                          ) : (
                            <UserCheck size={16} className="text-blue-600" />
                          )}
                          <span className="text-xs font-black uppercase tracking-widest">
                            {invite.role}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-${status.color}-500/10 text-${status.color}-600 border border-${status.color}-500/20`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {invite.isActive && !isExpired(invite) && !isMaxUsesReached(invite) && (
                            <button
                              onClick={() => copyInviteLink(invite.token)}
                              className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-colors"
                              title="Copy link"
                            >
                              {copiedToken === invite.token ? (
                                <Check size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => deactivateInvite(invite.id)}
                            className="p-2 hover:bg-rose-500/10 text-rose-600 rounded-lg transition-colors"
                            title="Deactivate"
                            disabled={!invite.isActive}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Link Preview */}
                      <div className="glass-inset p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                          <ExternalLink size={12} className="flex-shrink-0" />
                          <span className="truncate">{inviteUrl}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        {invite.maxUses !== null && (
                          <div className="flex items-center gap-1">
                            <Hash size={10} />
                            {invite.usedCount}/{invite.maxUses} uses
                          </div>
                        )}
                        {invite.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            Expires{" "}
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                        {invite.maxUses === null && !invite.expiresAt && (
                          <div className="flex items-center gap-1">
                            <RefreshCw size={10} />
                            No expiration
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 dark:bg-black/20 border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="w-full py-3 glass-card hover:bg-white dark:hover:bg-white/5 rounded-2xl font-black transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareProjectModal;