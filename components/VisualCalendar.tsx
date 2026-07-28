import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const VisualCalendar: React.FC = () => {
  const today = new Date();
  
  // State for the currently viewed month/year
  const [viewDate, setViewDate] = useState(new Date());

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const days = [];
  // Add empty slots for days of the previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleGoToday = () => {
    setViewDate(new Date());
  };

  return (
    <div className="glass-card p-6 rounded-[2rem] border-zinc-200 dark:border-white/5 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-zinc-500">
            Calendar
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleGoToday}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 transition-colors"
            title="Today"
          >
            <CalendarIcon size={14} />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
            {day.charAt(0)}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, index) => {
          const isToday = 
            day === today.getDate() && 
            viewMonth === today.getMonth() && 
            viewYear === today.getFullYear();
            
          return (
            <div
              key={index}
              className={`h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all relative
                ${day === null ? "invisible" : "hover:bg-zinc-100 dark:hover:bg-white/5 cursor-default"}
                ${isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}
              `}
            >
              <span className="relative z-10">{day}</span>
              {isToday && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 border-2 border-blue-500 rounded-full scale-[1.1] animate-pulse-glow" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span>Today</span>
          <button 
            onClick={handleGoToday}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-all"
          >
            {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualCalendar;
