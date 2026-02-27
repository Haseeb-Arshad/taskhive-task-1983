/**
 * LocalStorage Service for Blog Posts
 * Handles CRUD operations with automatic serialization and type safety.
 */

import type { BlogPost, BlogPostCreateInput, BlogPostUpdateInput } from './types';

const STORAGE_KEY = 'blog_posts';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * Calculate approximate size of an object in bytes
 */
function getObjectSize(obj: unknown): number {
  return new Blob([JSON.stringify(obj)]).size;
}

/**
 * Generate a unique slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique ID (nano ID alternative)
 */
function generateId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate reading time based on word count (avg 200 words/min)
 */
function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extract excerpt from content (first 160 characters)
 */
function extractExcerpt(title: string, contentBlocks: any[]): string {
  const paragraphBlock = contentBlocks.find((b) => b.type === 'paragraph');
  const text = paragraphBlock?.content || '';
  return text.substring(0, 160).trim() + (text.length > 160 ? '...' : '');
}

/**
 * Basic SEO score calculation (0-100)
 */
function calculateSeoScore(
  title: string,
  description: string,
  wordCount: number,
  hasImages: boolean,
  keywordsCount: number
): number {
  let score = 0;

  // Title check (max 15 points)
  if (title && title.length >= 30 && title.length <= 60) score += 15;
  else if (title && title.length > 0) score += 8;

  // Description check (max 20 points)
  if (description && description.length >= 120 && description.length <= 160) score += 20;
  else if (description && description.length > 0) score += 10;

  // Word count check (max 25 points) - optimal 300-3000 words
  if (wordCount >= 300 && wordCount <= 3000) score += 25;
  else if (wordCount >= 100) score += 12;

  // Images check (max 15 points)
  if (hasImages) score += 15;

  // Keywords check (max 25 points)
  if (keywordsCount >= 3) score += 25;
  else if (keywordsCount > 0) score += keywordsCount * 8;

  return Math.min(100, score);
}

/**
 * Get all blog posts from localStorage
 */
export function getAllPosts(): BlogPost[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const posts = JSON.parse(data) as BlogPost[];
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error('Failed to retrieve posts from localStorage:', error);
    return [];
  }
}

/**
 * Get a single blog post by ID
 */
export function getPostById(id: string): BlogPost | null {
  try {
    const posts = getAllPosts();
    return posts.find((p) => p.id === id) || null;
  } catch (error) {
    console.error(`Failed to retrieve post ${id}:`, error);
    return null;
  }
}

/**
 * Get posts by status (draft, published, etc.)
 */
export function getPostsByStatus(status: BlogPost['status']): BlogPost[] {
  try {
    const posts = getAllPosts();
    return posts.filter((p) => p.status === status);
  } catch (error) {
    console.error(`Failed to retrieve posts with status ${status}:`, error);
    return [];
  }
}

/**
 * Create a new blog post
 */
export function createPost(input: BlogPostCreateInput): BlogPost {
  const id = generateId();
  const now = new Date().toISOString();
  const slug = generateSlug(input.title);

  const newPost: BlogPost = {
    id,
    title: input.title,
    slug,
    status: 'draft',
    content: [],
    author: {
      name: input.authorName,
      email: input.authorEmail,
    },
    metadata: {
      wordCount: 0,
      readingTime: 0,
      seoScore: 0,
      excerpt: '',
      keywords: [],
    },
    tags: [],
    createdAt: now,
    updatedAt: now,
  };

  const posts = getAllPosts();
  posts.push(newPost);

  // Check storage limit
  const totalSize = getObjectSize(posts);
  if (totalSize > MAX_STORAGE_SIZE) {
    throw new Error(
      `Storage limit exceeded. Current: ${(totalSize / 1024).toFixed(2)}KB, Limit: ${(MAX_STORAGE_SIZE / 1024).toFixed(2)}KB`
    );
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return newPost;
  } catch (error) {
    console.error('Failed to create post:', error);
    throw new Error('Failed to save post to localStorage');
  }
}

/**
 * Update an existing blog post
 */
export function updatePost(id: string, updates: BlogPostUpdateInput): BlogPost | null {
  try {
    const posts = getAllPosts();
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) return null;

    const post = posts[postIndex];
    const updatedPost: BlogPost = {
      ...post,
      ...updates,
      id: post.id, // Preserve ID
      createdAt: post.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    // Recalculate metadata if content changes
    if (updates.content) {
      const wordCount = updates.content
        .filter((b) => b.type === 'paragraph')
        .reduce((count, b) => count + b.content.split(/\s+/).length, 0);

      const hasImages = updates.content.some((b) => b.type === 'image');
      const keywordsCount = updates.seoKeywords?.length || 0;

      updatedPost.metadata = {
        wordCount,
        readingTime: calculateReadingTime(wordCount),
        seoScore: calculateSeoScore(
          updates.seoTitle || updatedPost.title,
          updates.seoDescription || '',
          wordCount,
          hasImages,
          keywordsCount
        ),
        excerpt: extractExcerpt(updatedPost.title, updates.content),
        keywords: updates.seoKeywords || [],
      };
    }

    posts[postIndex] = updatedPost;

    // Check storage limit
    const totalSize = getObjectSize(posts);
    if (totalSize > MAX_STORAGE_SIZE) {
      throw new Error(
        `Storage limit exceeded. Current: ${(totalSize / 1024).toFixed(2)}KB, Limit: ${(MAX_STORAGE_SIZE / 1024).toFixed(2)}KB`
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return updatedPost;
  } catch (error) {
    console.error(`Failed to update post ${id}:`, error);
    return null;
  }
}

/**
 * Delete a blog post
 */
export function deletePost(id: string): boolean {
  try {
    const posts = getAllPosts();
    const filtered = posts.filter((p) => p.id !== id);

    if (filtered.length === posts.length) return false; // Post not found

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error(`Failed to delete post ${id}:`, error);
    return false;
  }
}

/**
 * Duplicate a blog post
 */
export function duplicatePost(id: string): BlogPost | null {
  try {
    const post = getPostById(id);
    if (!post) return null;

    const newId = generateId();
    const now = new Date().toISOString();

    const duplicatedPost: BlogPost = {
      ...post,
      id: newId,
      slug: `${post.slug}-copy-${Date.now()}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
    };

    const posts = getAllPosts();
    posts.push(duplicatedPost);

    const totalSize = getObjectSize(posts);
    if (totalSize > MAX_STORAGE_SIZE) {
      throw new Error(
        `Storage limit exceeded. Current: ${(totalSize / 1024).toFixed(2)}KB, Limit: ${(MAX_STORAGE_SIZE / 1024).toFixed(2)}KB`
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return duplicatedPost;
  } catch (error) {
    console.error(`Failed to duplicate post ${id}:`, error);
    return null;
  }
}

/**
 * Clear all blog posts (use with caution)
 */
export function clearAllPosts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear posts:', error);
  }
}

/**
 * Export posts as JSON
 */
export function exportPostsAsJson(): string {
  try {
    const posts = getAllPosts();
    return JSON.stringify(posts, null, 2);
  } catch (error) {
    console.error('Failed to export posts:', error);
    return '';
  }
}

/**
 * Import posts from JSON (merges with existing)
 */
export function importPostsFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const importedPosts = JSON.parse(jsonString) as BlogPost[];

    if (!Array.isArray(importedPosts)) {
      return { success: false, count: 0, error: 'JSON must contain an array of posts' };
    }

    const existingPosts = getAllPosts();
    const mergedPosts = [...existingPosts];
    let importedCount = 0;

    for (const post of importedPosts) {
      // Check if post already exists
      const existingIndex = mergedPosts.findIndex((p) => p.id === post.id);
      if (existingIndex === -1) {
        mergedPosts.push(post);
        importedCount++;
      }
    }

    const totalSize = getObjectSize(mergedPosts);
    if (totalSize > MAX_STORAGE_SIZE) {
      return {
        success: false,
        count: 0,
        error: `Storage limit exceeded. Current: ${(totalSize / 1024).toFixed(2)}KB, Limit: ${(MAX_STORAGE_SIZE / 1024).toFixed(2)}KB`,
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPosts));
    return { success: true, count: importedCount };
  } catch (error) {
    return { success: false, count: 0, error: String(error) };
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): { used: number; limit: number; usedPercent: number; posts: number } {
  try {
    const posts = getAllPosts();
    const used = getObjectSize(posts);
    return {
      used,
      limit: MAX_STORAGE_SIZE,
      usedPercent: Math.round((used / MAX_STORAGE_SIZE) * 100),
      posts: posts.length,
    };
  } catch (error) {
    return { used: 0, limit: MAX_STORAGE_SIZE, usedPercent: 0, posts: 0 };
  }
}
