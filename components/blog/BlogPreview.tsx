'use client';

import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

interface BlogPreviewProps {
  post: BlogPost;
  isFullScreen?: boolean;
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const parseHTMLToPlainText = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export default function BlogPreview({ post, isFullScreen = false }: BlogPreviewProps) {
  const readingTime = calculateReadingTime(parseHTMLToPlainText(post.content));
  const previewContent = parseHTMLToPlainText(post.content).substring(0, 300);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  if (isFullScreen) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="prose prose-lg max-w-4xl mx-auto prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
      >
        {/* Hero Section with Featured Image */}
        {post.featuredImage && (
          <motion.div
            variants={itemVariants}
            className="relative h-[400px] -mx-4 sm:mx-0 rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1 variants={itemVariants} className="text-5xl font-bold text-zinc-900 mb-4">
          {post.title}
        </motion.h1>

        {/* Metadata */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-4 text-zinc-600 mb-8 pb-8 border-b border-zinc-200"
        >
          <span className="font-semibold">{post.author || 'Anonymous'}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </motion.div>

        {/* SEO Description */}
        {post.seoDescription && (
          <motion.p variants={itemVariants} className="text-lg text-zinc-700 italic mb-8">
            {post.seoDescription}
          </motion.p>
        )}

        {/* Content */}
        <motion.div
          variants={itemVariants}
          className="prose-content text-zinc-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-zinc-200">
            {post.tags.map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 rounded-full text-sm font-medium border border-blue-200/50"
              >
                #{tag}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Card preview
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <GlassCard className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            variants={itemVariants}
            className="relative h-48 overflow-hidden -m-6 mb-0"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        )}

        <div className="p-6">
          {/* Category & Status */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {post.category}
            </span>
            {post.status === 'published' && (
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Published
              </span>
            )}
            {post.status === 'draft' && (
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Draft
              </span>
            )}
          </motion.div>

          {/* Title */}
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </motion.h3>

          {/* Excerpt */}
          <motion.p variants={itemVariants} className="text-zinc-600 text-sm mb-4 line-clamp-3">
            {post.excerpt || previewContent}
          </motion.p>

          {/* Metadata */}
          <motion.div variants={itemVariants} className="flex items-center justify-between text-xs text-zinc-500 mb-4">
            <span>{formatDate(post.createdAt)}</span>
            <span>{readingTime} min read</span>
          </motion.div>

          {/* Tags Preview */}
          {post.tags && post.tags.length > 0 && (
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-blue-100/50 text-blue-700 rounded-md font-medium">
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-zinc-100/50 text-zinc-600 rounded-md font-medium">
                  +{post.tags.length - 3}
                </span>
              )}
            </motion.div>
          )}

          {/* Author */}
          <motion.div variants={itemVariants} className="text-xs text-zinc-500 font-medium">
            By {post.author || 'Anonymous'}
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
