'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Clock } from '@phosphor-icons/react';
import ImageUploader from './ImageUploader';
import { useAutoSave } from '@/hooks/useAutoSave';
import { BlogPost } from '@/lib/types';

interface BlogEditorProps {
  initialData?: BlogPost;
  onSave?: (data: BlogPost) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSave }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorContentRef = useRef<string>(initialData?.content || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: 'Begin your story here... Write freely, edit beautifully.',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialData?.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-slate max-w-none focus:outline-none py-4 px-6 text-slate-700 leading-relaxed',
      },
      handleDOMEvents: {
        paste: (view, event) => {
          const items = event.clipboardData?.items;
          if (!items) return false;

          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                handleImagePaste(file);
                event.preventDefault();
                return true;
              }
            }
          }
          return false;
        },
      },
    },
  });

  const handleImagePaste = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          editor.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error pasting image:', error);
      }
    },
    [editor]
  );

  const handleImageInsert = useCallback(
    (imageUrl: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    },
    [editor]
  );

  const { autoSave } = useAutoSave({
    onSave: async (data) => {
      setIsSaving(true);
      setSaveStatus('saving');
      try {
        const contentToSave = editor?.getHTML() || editorContentRef.current;
        editorContentRef.current = contentToSave;
        
        const blogPost: BlogPost = {
          ...data,
          title,
          excerpt,
          content: contentToSave,
          updatedAt: new Date(),
        };

        onSave?.(blogPost);
        setSaveStatus('saved');
        setLastSaved(new Date());

        setTimeout(() => {
          if (saveStatus === 'saved') {
            setSaveStatus('idle');
          }
        }, 3000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    },
    debounceDelay: 2000,
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      editorContentRef.current = editor.getHTML();
      autoSave({
        title,
        excerpt,
        content: editor.getHTML(),
        createdAt: initialData?.createdAt || new Date(),
      });
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, autoSave, title, excerpt, initialData?.createdAt]);

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Blog Editor</h1>
              <p className="text-xs text-slate-500">Craft your story</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Save Status */}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent"
                />
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-green-600"
                >
                  <Check size={18} weight="bold" />
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-red-600"
                >
                  <AlertCircle size={18} weight="bold" />
                </motion.div>
              )}

              <span className="text-xs text-slate-600 font-medium">
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'error' && 'Save failed'}
                {saveStatus === 'idle' && lastSaved
                  ? `Saved ${Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago`
                  : ''}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog post title..."
            className="w-full text-4xl font-bold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-slate-300 mb-4"
          />
          <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Excerpt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief summary of your post (optional)..."
            maxLength={160}
            className="w-full text-base text-slate-600 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-slate-400 resize-none h-16"
          />
          <div className="text-xs text-slate-500 text-right">
            {excerpt.length}/160
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6 flex-wrap"
        >
          <ImageUploader onImageSelect={handleImageInsert} />
          <div className="flex-1" />
          <div className="text-xs text-slate-500 font-medium">
            {wordCount} words • {charCount} characters
          </div>
        </motion.div>

        {/* Editor Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-100/20 to-pink-100/20 rounded-2xl pointer-events-none" />
          <div className="relative bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl shadow-purple-500/5 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <EditorContent editor={editor} />
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-xs text-slate-500"
        >
          <p>
            {lastSaved && (
              <span className="flex items-center justify-center gap-2">
                <Clock size={14} />
                Last auto-saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogEditor;