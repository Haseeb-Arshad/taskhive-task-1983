'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BlogPost } from '@/lib/types';

interface UseAutoSaveOptions {
  onSave: (data: BlogPost) => Promise<void>;
  debounceDelay?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseAutoSaveReturn {
  autoSave: (data: BlogPost) => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: Error | null;
  clearError: () => void;
}

/**
 * Custom hook for auto-saving blog post data with debouncing and retry logic
 * 
 * Features:
 * - Debounced saving to avoid excessive API calls
 * - Automatic retry with exponential backoff
 * - Offline detection and queue management
 * - Graceful error handling
 * - TypeScript support for BlogPost type
 */
export const useAutoSave = ({
  onSave,
  debounceDelay = 3000,
  maxRetries = 3,
  retryDelay = 1000,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Refs for debouncing and retry logic
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const pendingDataRef = useRef<BlogPost | null>(null);
  const isSavingRef = useRef(false);
  const isOnlineRef = useRef(typeof navigator !== 'undefined' && navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      // Try to save pending data when coming back online
      if (pendingDataRef.current) {
        executeAutoSave(pendingDataRef.current);
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((data: BlogPost) => {
    try {
      const key = `blog_draft_${data.id || 'new'}`;
      localStorage.setItem(key, JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, []);

  // Execute the actual save with retry logic
  const executeAutoSave = useCallback(
    async (data: BlogPost, attemptNumber = 1) => {
      // Don't save if already saving
      if (isSavingRef.current) {
        pendingDataRef.current = data;
        return;
      }

      // Don't save if offline
      if (!isOnlineRef.current) {
        pendingDataRef.current = data;
        saveToLocalStorage(data);
        return;
      }

      isSavingRef.current = true;
      setIsSaving(true);
      retryCountRef.current = attemptNumber - 1;

      try {
        // Save to localStorage first (optimistic)
        saveToLocalStorage(data);

        // Call the onSave callback
        await onSave(data);

        setLastSavedAt(new Date());
        setError(null);
        pendingDataRef.current = null;
        retryCountRef.current = 0;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Auto-save failed');
        setError(error);

        // Retry logic with exponential backoff
        if (attemptNumber < maxRetries) {
          const backoffDelay = retryDelay * Math.pow(2, attemptNumber - 1);
          setTimeout(() => {
            if (pendingDataRef.current) {
              executeAutoSave(pendingDataRef.current, attemptNumber + 1);
            }
          }, backoffDelay);
        } else {
          console.error(`Auto-save failed after ${maxRetries} attempts:`, error);
        }
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [onSave, maxRetries, retryDelay, saveToLocalStorage]
  );

  // Debounced auto-save function
  const autoSave = useCallback(
    (data: BlogPost) => {
      pendingDataRef.current = data;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          executeAutoSave(pendingDataRef.current);
        }
      }, debounceDelay);
    },
    [debounceDelay, executeAutoSave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingDataRef.current && isSavingRef.current) {
        // Clear debounce and save immediately
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        // Try to save synchronously if possible
        saveToLocalStorage(pendingDataRef.current);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [saveToLocalStorage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    autoSave,
    isSaving,
    lastSavedAt,
    error,
    clearError,
  };
};