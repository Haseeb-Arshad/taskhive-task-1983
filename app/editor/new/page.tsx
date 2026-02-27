'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/layout/Header';
import BlogEditor from '@/components/editor/BlogEditor';
import { BlogPost } from '@/lib/types';
import { saveBlogPost } from '@/lib/storage';

const defaultPost: BlogPost = {
  id: uuidv4(),
  title: 'Untitled Post',
  excerpt: 'Write a captivating excerpt for your blog post...',
  content: '',
  featuredImage: null,
  category: 'Technology',
  tags: [],
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  seoTitle: '',
  seoDescription: '',
  author: 'Anonymous Author',
};

export default function NewPostPage() {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>(defaultPost);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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
        isNewPost={true}
      />
    </>
  );
}
