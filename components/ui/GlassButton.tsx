'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
  primary: `
    bg-white/20
    border-white/30
    text-slate-900
    hover:bg-white/30
    hover:border-white/40
    shadow-[0_8px_16px_-3px_rgba(0,0,0,0.1)]
    hover:shadow-[0_12px_24px_-5px_rgba(0,0,0,0.15)]
  `,
  secondary: `
    bg-white/5
    border-white/10
    text-white
    hover:bg-white/10
    hover:border-white/20
    shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)]
  `,
  ghost: `
    bg-transparent
    border-white/20
    text-white
    hover:bg-white/5
    hover:border-white/30
  `,
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  type = 'button',
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      className={`
        relative
        backdrop-blur-lg
        border
        rounded-xl
        font-medium
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {/* Inner refraction border */}
      <div
        className="
          absolute inset-0
          rounded-xl
          border border-white/10
          pointer-events-none
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
        "
      />

      {/* Content with loading state */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
      </div>
    </motion.button>
  );
};

export default GlassButton;