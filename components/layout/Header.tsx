'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassButton from '@/components/ui/GlassButton';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublished?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Blog Portal',
  subtitle = 'Create and publish beautiful blog posts',
  onSave,
  onPublish,
  isSaving = false,
  isPublished = false,
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      className="
        fixed top-0 left-0 right-0 z-40
        backdrop-blur-xl
        bg-white/10 dark:bg-slate-900/10
        border-b border-white/20 dark:border-white/10
        shadow-[0_4px_12px_-3px_rgba(0,0,0,0.05)]
      "
    >
      {/* Inner refraction border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              delay: 0.1,
            }}
            className="flex items-center gap-4"
          >
            {/* Logo */}
            <div className="relative w-10 h-10 rounded-xl backdrop-blur-lg bg-white/20 border border-white/30 flex items-center justify-center shadow-[0_8px_16px_-3px_rgba(0,0,0,0.1)]">
              <svg
                className="w-6 h-6 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2m2 2a2 2 0 002-2m-2 2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2m0-5V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>

            {/* Text */}
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>

          {/* Right: Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              delay: 0.15,
            }}
            className="flex items-center gap-3"
          >
            {/* Save Status Indicator */}
            {isSaving && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border border-current border-t-transparent rounded-full"
                />
                Saving...
              </motion.div>
            )}

            {/* Publish Status Badge */}
            {isPublished && !isSaving && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-xs font-medium text-green-700 dark:text-green-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Published
              </motion.div>
            )}

            {/* Save Button */}
            {onSave && (
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={onSave}
                isLoading={isSaving}
                className="gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-4-2m4 2l4-2"
                  />
                </svg>
                Save
              </GlassButton>
            )}

            {/* Publish Button */}
            {onPublish && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={onPublish}
                className="gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                  />
                </svg>
                Publish
              </GlassButton>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;