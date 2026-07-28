import React from 'react';
import { Search, Bell, Plus, PanelLeft } from 'lucide-react';
import Magnetic from './Magnetic.tsx';

interface NavbarProps {
  store: any;
  toggleSidebar: () => void;
  toggleActivity: () => void;
  isSidebarOpen: boolean;
  isActivityOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  store, 
  toggleSidebar, 
  toggleActivity, 
  isSidebarOpen, 
  isActivityOpen 
}) => {
  const { currentUser, openTaskModal } = store;

  return (
    <header className="h-20 glass-premium flex items-center justify-between px-8 z-40 sticky top-0 !border-x-0 !border-t-0 shadow-lg transition-all duration-500">
      <div className="flex items-center gap-6 flex-1">
        {!isSidebarOpen && (
          <Magnetic strength={0.3}>
            <button 
              onClick={toggleSidebar}
              className="p-2.5 text-surface-500 hover:text-brand-500 hover:bg-brand-500/10 rounded-xl transition-all border border-transparent hover:border-brand-500/20 active:scale-90"
            >
              <PanelLeft size={22} />
            </button>
          </Magnetic>
        )}
        
        <div className="relative max-w-md w-full group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Quick search (⌘K)" 
            className="w-full glass-inset !bg-white/5 dark:!bg-white/[0.02] !border-white/10 focus:!border-brand-500/40 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none transition-all shadow-inner focus:shadow-brand/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Magnetic strength={0.2}>
          <button 
            onClick={openTaskModal}
            className="hidden md:flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-brand active:scale-95 hover:scale-[1.02]"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </Magnetic>

        <div className="h-8 w-px bg-surface-200 dark:bg-white/10 mx-1"></div>



        <Magnetic strength={0.4}>
          <button 
            onClick={toggleActivity}
            className={`p-2.5 rounded-full transition-all relative ${
              isActivityOpen 
                ? 'bg-brand-500 text-white shadow-brand scale-110' 
                : 'text-surface-500 hover:text-brand-500 hover:bg-brand-500/10 border border-transparent hover:border-brand-500/20'
            }`}
            title="Activity Feed"
          >
            <Bell size={22} />
            {!isActivityOpen && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-surface-950 animate-pulse-glow"></span>}
          </button>
        </Magnetic>

        <div className="flex items-center gap-4 pl-3 border-l border-surface-200 dark:border-white/10">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-bold tracking-tight text-surface-900 dark:text-white leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-brand-500 mt-1 uppercase tracking-widest font-black opacity-90">{currentUser.role}</p>
          </div>
          <div className="relative group cursor-pointer">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-2xl border-2 border-white dark:border-surface-800 object-cover shadow-premium group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-surface-950 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
