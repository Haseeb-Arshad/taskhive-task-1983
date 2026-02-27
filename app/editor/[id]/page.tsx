'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import BlogEditor from '@/components/editor/BlogEditor';
import GlassCard from '@/components/ui/GlassCard';
import { BlogPost } from '@/lib/types';
import { loadBlogPost, saveBlogPost } from '@/lib/storage';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        const loadedPost = loadBlogPost(postId);
        if (!loadedPost) {
          setError('Post not found');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }
        setPost(loadedPost);
      } catch (err) {
        console.error('Failed to load post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, router]);

  const handleSave = async (updatedPost: BlogPost) => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const postToSave = {
        ...updatedPost,
        updatedAt: new Date(),
      };
      saveBlogPost(postToSave);
      setPost(postToSave);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save post:', error);
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (updatedPost: BlogPost) => {
    setIsSaving(true);
    try {
      const publishedPost = {
        ...updatedPost,
        status: 'published' as const,
        updatedAt: new Date(),
      };
      saveBlogPost(publishedPost);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-50 via-white to-slate-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <GlassCard className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-300 border-t-blue-600 mx-auto mb-4" />
              <p className="text-zinc-600 font-medium">Loading post...</p>
            </GlassCard>
          </motion.div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-50 via-white to-slate-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <GlassCard className="p-8 text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-zinc-900 font-bold mb-2">Error</p>
              <p className="text-zinc-600 mb-6">{error || 'Failed to load post'}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <BlogEditor
        post={post}
        onSave={handleSave}
        onPublish={handlePublish}
        onBack={handleBack}
        isSaving={isSaving}
        saveStatus={saveStatus}
        isNewPost={false}
      />
    </>
  );
}
