import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-premium p-7 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden group transition-all"
    >
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${colorMap[color].split(' ')[1]}`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-3.5 rounded-2xl shadow-inner ${colorMap[color]} transition-transform group-hover:scale-110 duration-500`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 space-y-1">
        <h3 className="text-surface-500 dark:text-surface-400 text-xs font-black uppercase tracking-[0.15em] opacity-80">
          {label}
        </h3>
        <p className="text-4xl font-black tracking-tighter text-surface-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"></div>
    </motion.div>
  );
};

export default StatsCard;
