import React, { useState } from 'react';
import { Mail, Shield, MoreVertical, Search, Link as LinkIcon, Check, Copy, UserPlus, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DotGrid from "../components/DotGrid";

interface TeamProps {
  store: any;
}

const Team: React.FC<TeamProps> = ({ store }) => {
  const navigate = useNavigate();
  const {
    users = [],
    activeWorkspace = { id: '', name: '' },
    joinWorkspace
  } = store || {};
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const inviteLink = `https://zenspace.app/join/${activeWorkspace?.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinWorkspace(joinCode)) {
      setJoinCode('');
      setShowJoinModal(false);
    } else {
      alert("Invalid code or workspace not found.");
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            The Squad
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Collaborators in <span className="text-blue-500 font-black">{activeWorkspace?.name}</span>
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex-1 md:flex-none glass-card !bg-white/5 dark:!bg-white/5 hover:!bg-white/10 border border-zinc-200 dark:border-white/10 px-6 py-3.5 rounded-2xl text-sm font-black transition-all shadow-sm active:scale-95 text-zinc-600 dark:text-zinc-300"
          >
            Join Team
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 group/btn"
          >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
            <span>Invite Members</span>
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/30 dark:bg-white/5">
           <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name......" 
              className="w-full glass-inset !border-transparent py-3 pl-11 pr-4 text-sm rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Workspace Population</p>
              <p className="text-lg font-black">{filteredUsers.length} members</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-black/20 text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Member</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-medium">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform" alt="" />
                        <div>
                          <p className="text-sm font-bold tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">@{user.name.toLowerCase().replace(' ', '')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={14} className={user.role === 'Admin' ? 'text-blue-500' : 'text-zinc-400'} />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-zinc-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="opacity-40" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Online
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl text-zinc-400 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl p-10 space-y-10 animate-in zoom-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black tracking-tighter">Invite to Projects</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="space-y-6">
              {/* Info Card */}
              <div className="glass-inset p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <LinkIcon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">Use Project Invite Links</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Invite members to specific projects using shareable invite links. Each project can have its own custom invite link with role permissions.
                    </p>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">How It Works</h4>
                <div className="space-y-2">
                  {[
                    { step: 1, text: 'Go to any project details page' },
                    { step: 2, text: 'Click the "Share" button' },
                    { step: 3, text: 'Generate an invite link' },
                    { step: 4, text: 'Share the link with your team' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-black">
                        {item.step}
                      </div>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    navigate('/projects');
                  }}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Go to Projects</span>
                  <ExternalLink size={18} />
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-4 glass-card hover:bg-white dark:hover:bg-white/5 rounded-2xl font-black transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl p-10 space-y-8 animate-in zoom-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black tracking-tighter">Join Team</h2>
               <button onClick={() => setShowJoinModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Team Code</label>
                <input 
                  required
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="Enter join code or name"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-center uppercase tracking-widest"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Join Workspace</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal utility component
const X = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Team;