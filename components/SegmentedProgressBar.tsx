import React from "react";
import { motion } from "framer-motion";

interface SegmentedProgressBarProps {
  progress: number;
  segments?: number;
  className?: string;
  activeColor?: string;
  height?: string;
}

const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  progress,
  segments = 35,
  className = "",
  activeColor = "bg-brand-500",
  height = "h-6",
}) => {
  const activeSegments = Math.round((progress / 100) * segments);

  return (
    <div className={`flex gap-[3px] items-center w-full ${height} ${className}`}>
      {Array.from({ length: segments }).map((_, i) => {
        const isActive = i < activeSegments;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scaleY: 0.6 }}
            animate={{ 
              opacity: isActive ? 1 : 0.2,
              scaleY: isActive ? 1 : 0.7,
            }}
            transition={{
              duration: 0.4,
              delay: i * 0.01,
              ease: "easeOut"
            }}
            className={`flex-1 h-full rounded-full transition-all duration-500 ${
              isActive
                ? activeColor + " shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          />
        );
      })}
    </div>
  );
};

export default SegmentedProgressBar;
