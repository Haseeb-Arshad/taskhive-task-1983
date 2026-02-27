/**
 * BlogPost Data Model
 * Defines the complete structure for blog posts including metadata, content, and media.
 */

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type ContentBlockType = 'heading' | 'paragraph' | 'image' | 'video' | 'callout' | 'code' | 'quote';

export interface ImageAsset {
  id: string;
  src: string; // base64 or URL
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
  content: string; // markdown or raw text
  metadata?: Record<string, unknown>; // type-specific data
}

export interface BlogPostMetadata {
  wordCount: number;
  readingTime: number; // minutes
  seoScore: number; // 0-100
  excerpt: string;
  keywords: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: BlogPostStatus;
  content: ContentBlock[];
  featuredImage?: ImageAsset;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  metadata: BlogPostMetadata;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface BlogPostCreateInput {
  title: string;
  authorName: string;
  authorEmail: string;
}

export interface BlogPostUpdateInput {
  title?: string;
  slug?: string;
  status?: BlogPostStatus;
  content?: ContentBlock[];
  featuredImage?: ImageAsset;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  scheduledAt?: string;
}
