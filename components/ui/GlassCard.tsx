'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
      }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        relative
        backdrop-blur-xl
        bg-white/10
        border border-white/20
        rounded-[2rem]
        p-8
        shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]
        transition-all duration-300 ease-out
        hover:border-white/30
        hover:bg-white/15
        hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Inner refraction border for liquid glass effect */}
      <div
        className="
          absolute inset-0
          rounded-[2rem]
          border border-white/10
          pointer-events-none
          shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]
        "
      />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;