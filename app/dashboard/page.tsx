'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Clock, Eye, Trash2, Edit, ChevronRight } from '@phosphor-icons/react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import Header from '@/components/layout/Header';
import { BlogPost } from '@/lib/types';
import { loadBlogPosts, deleteBlogPost } from '@/lib/storage';

interface BlogListItem extends BlogPost {
  readingTime: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2 },
  },
};

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const allPosts = loadBlogPosts();
        const enrichedPosts = allPosts.map((post) => ({
          ...post,
          readingTime: calculateReadingTime(post.content),
        }));
        setPosts(enrichedPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    let result = posts;

    if (searchQuery.trim()) {
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((post) => post.status === statusFilter);
    }

    setFilteredPosts(result);
  }, [posts, searchQuery, statusFilter]);

  const handleDelete = (id: string) => {
    try {
      deleteBlogPost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <>
      <Header />
      <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-50 via-white to-slate-50">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
            animate={{
              y: [0, 40, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-zinc-900 mb-2">
                  Blog Posts
                </h1>
                <p className="text-lg text-zinc-600">
                  Create, manage, and publish your stories with elegance.
                </p>
              </div>
              <Link href="/editor/new">
                <GlassButton className="gap-2 whitespace-nowrap">
                  <Plus size={18} weight="bold" />
                  New Post
                </GlassButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 font-medium">Total Posts</p>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{posts.length}</p>
                </div>
                <div className="text-4xl opacity-20">📝</div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 font-medium">Published</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
                </div>
                <div className="text-4xl opacity-20">✓</div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 font-medium">Drafts</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{draftCount}</p>
                </div>
                <div className="text-4xl opacity-20">✎</div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            <div className="flex-1">
              <GlassInput
                placeholder="Search posts by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'draft', 'published'] as const).map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    statusFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/30 text-zinc-700 border border-white/40 hover:bg-white/50 backdrop-blur-md'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Posts List */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/40 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <GlassCard className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-30">✍️</div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">No posts found</h3>
                <p className="text-zinc-600 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Create your first blog post to get started.'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link href="/editor/new">
                    <GlassButton className="gap-2">
                      <Plus size={18} weight="bold" />
                      Create New Post
                    </GlassButton>
                  </Link>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    layout
                    layoutId={post.id}
                  >
                    <GlassCard className="p-6 hover:shadow-xl transition-all duration-300 group cursor-default">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Featured Image */}
                        {post.featuredImage && (
                          <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-300 to-purple-300">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-zinc-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {post.title}
                                </h3>
                                {post.status === 'published' && (
                                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                    Published
                                  </span>
                                )}
                                {post.status === 'draft' && (
                                  <span className="px-3 py-1 bg-amber-500/20 text-amber-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-zinc-600 line-clamp-2">{post.excerpt}</p>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock size={14} weight="bold" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={14} weight="bold" />
                              <span>{post.readingTime} min read</span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-blue-100/50 text-blue-700 rounded-md text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 2 && (
                                  <span className="px-2 py-0.5 bg-zinc-200/50 text-zinc-600 rounded-md text-xs font-medium">
                                    +{post.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Link href={`/editor/${post.id}`} className="flex-1 sm:flex-initial">
                              <GlassButton className="w-full sm:w-auto gap-2 text-sm">
                                <Edit size={16} weight="bold" />
                                Edit
                              </GlassButton>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDeleteConfirm(post.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 size={18} weight="bold" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard className="p-8 max-w-md">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Post?</h3>
                  <p className="text-zinc-600 mb-6">
                    This action cannot be undone. The post will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
