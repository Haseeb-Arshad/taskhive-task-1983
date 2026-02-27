'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from '@phosphor-icons/react';
import { processImage } from '@/lib/image-handler';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  maxFileSize?: number; // in MB
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, maxFileSize = 5 }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    return true;
  };

  const handleImageProcess = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
        }, 200);

        const processedImage = await processImage(file);
        setUploadProgress(100);

        clearInterval(progressInterval);

        // Set preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setPreviewUrl(url);
          onImageSelect(url);
          
          // Reset after successful upload
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setPreviewUrl(null);
          }, 1500);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        clearInterval(uploadProgress as unknown as NodeJS.Timeout);
        setError('Failed to process image. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [maxFileSize, onImageSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragActive(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleImageProcess(files[0]);
      }
    },
    [handleImageProcess]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleImageProcess(files[0]);
      }
    },
    [handleImageProcess]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className="relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Zone */}
      <motion.div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          borderColor: isDragActive ? '#a78bfa' : 'transparent',
          backgroundColor: isDragActive ? 'rgba(167, 139, 250, 0.05)' : 'transparent',
        }}
        className="relative h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 overflow-hidden group"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

        {/* Content */}
        <div className="relative flex items-center gap-2">
          {isUploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent"
              />
              <span className="text-xs font-medium text-slate-700">
                {Math.round(uploadProgress)}%
              </span>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="text-slate-600"
              >
                <Upload size={16} weight="bold" />
              </motion.div>
              <span className="text-xs font-medium text-slate-700">Upload Image</span>
            </>
          )}
        </div>

        {/* Drag Active Indicator */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
          >
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
            <button
              onClick={handleClearError}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <X size={14} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: uploadProgress / 100 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 origin-left"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 mb-2">Uploading...</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-10 text-right">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;