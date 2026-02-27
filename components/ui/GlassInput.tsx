'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'large';
}

const variantStyles = {
  default: 'px-4 py-2.5 text-base',
  large: 'px-6 py-4 text-lg',
};

export const GlassInput = React.forwardRef<
  HTMLInputElement,
  GlassInputProps
>((
  {
    label,
    error,
    helperText,
    icon,
    variant = 'default',
    className = '',
    disabled = false,
    ...props
  },
  ref,
) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}

        <motion.input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          disabled={disabled}
          animate={{
            borderColor: isFocused
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.15)',
            backgroundColor: isFocused
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(255, 255, 255, 0.08)',
          }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 25,
          }}
          className={`
            w-full
            backdrop-blur-lg
            border
            rounded-xl
            bg-white/8
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-300 ease-out
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${variantStyles[variant]}
            ${error ? 'border-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Inner refraction border */}
        <div
          className={`
            absolute inset-0
            rounded-xl
            border border-white/10
            pointer-events-none
            shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
            transition-opacity duration-300
            ${isFocused ? 'opacity-100' : 'opacity-50'}
          `}
        />
      </div>

      {/* Helper text or error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;