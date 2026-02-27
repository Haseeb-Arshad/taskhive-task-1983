import * as storage from '@/lib/storage';
import { BlogPost } from '@/lib/types';

describe('Storage Module', () => {
  const mockPost: BlogPost = {
    id: '1',
    title: 'Test Post',
    content: 'Test content here',
    excerpt: 'Test excerpt',
    featuredImage: 'https://example.com/image.jpg',
    tags: ['test', 'storage'],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('savePost', () => {
    it('should save post to localStorage with correct key', async () => {
      const result = await storage.savePost(mockPost);

      expect(result).toEqual(mockPost);
      
      const stored = localStorage.getItem(`post_${mockPost.id}`);
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(mockPost);
    });

    it('should update existing post', async () => {
      await storage.savePost(mockPost);
      
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      const result = await storage.savePost(updatedPost);

      expect(result.title).toBe('Updated Title');
      
      const stored = JSON.parse(localStorage.getItem(`post_${mockPost.id}`)!);
      expect(stored.title).toBe('Updated Title');
    });

    it('should set updatedAt timestamp', async () => {
      const postWithoutTimestamp = { ...mockPost };
      delete postWithoutTimestamp.updatedAt;
      
      const result = await storage.savePost(postWithoutTimestamp as any);

      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
        new Date(mockPost.createdAt).getTime()
      );
    });

    it('should handle save failures gracefully', async () => {
      const quotaExceededError = new Error('QuotaExceededError');
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaExceededError;
      });

      await expect(storage.savePost(mockPost)).rejects.toThrow();
    });
  });

  describe('loadPost', () => {
    it('should load post from localStorage', async () => {
      localStorage.setItem(`post_${mockPost.id}`, JSON.stringify(mockPost));

      const result = await storage.loadPost(mockPost.id);

      expect(result).toEqual(mockPost);
    });

    it('should return null for non-existent post', async () => {
      const result = await storage.loadPost('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem(`post_corrupt`, '{invalid json}');

      const result = await storage.loadPost('corrupt');

      expect(result).toBeNull();
    });

    it('should validate post schema before returning', async () => {
      const invalidPost = { title: 'Missing required fields' };
      localStorage.setItem(`post_${mockPost.id}`, JSON.stringify(invalidPost));

      const result = await storage.loadPost(mockPost.id);

      expect(result).toBeNull();
    });
  });

  describe('deletePost', () => {
    it('should remove post from localStorage', async () => {
      localStorage.setItem(`post_${mockPost.id}`, JSON.stringify(mockPost));

      await storage.deletePost(mockPost.id);

      expect(localStorage.getItem(`post_${mockPost.id}`)).toBeNull();
    });

    it('should return success even if post does not exist', async () => {
      const result = await storage.deletePost('non-existent-id');

      expect(result).toBe(true);
    });
  });

  describe('listPosts', () => {
    it('should return all saved posts', async () => {
      const post1 = { ...mockPost, id: '1' };
      const post2 = { ...mockPost, id: '2' };

      await storage.savePost(post1);
      await storage.savePost(post2);

      const result = await storage.listPosts();

      expect(result).toHaveLength(2);
      expect(result.map(p => p.id)).toContain('1');
      expect(result.map(p => p.id)).toContain('2');
    });

    it('should return empty array when no posts exist', async () => {
      const result = await storage.listPosts();

      expect(result).toEqual([]);
    });

    it('should filter by status', async () => {
      const draftPost = { ...mockPost, id: '1', status: 'draft' as const };
      const publishedPost = { ...mockPost, id: '2', status: 'published' as const };

      await storage.savePost(draftPost);
      await storage.savePost(publishedPost);

      const result = await storage.listPosts({ status: 'published' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should sort posts by creation date', async () => {
      const olderPost = {
        ...mockPost,
        id: '1',
        createdAt: '2024-01-01T00:00:00Z',
      };
      const newerPost = {
        ...mockPost,
        id: '2',
        createdAt: '2024-01-02T00:00:00Z',
      };

      await storage.savePost(olderPost);
      await storage.savePost(newerPost);

      const result = await storage.listPosts({ sortBy: 'newest' });

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });
  });

  describe('uploadImage', () => {
    it('should validate image file type', async () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      await expect(storage.uploadImage(invalidFile)).rejects.toThrow(
        /invalid file type/i
      );
    });

    it('should validate image file size (max 5MB)', async () => {
      const largeFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );

      await expect(storage.uploadImage(largeFile)).rejects.toThrow(
        /file too large/i
      );
    });

    it('should accept valid image formats', async () => {
      const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const format of validFormats) {
        const file = new File(['content'], `test.${format.split('/')[1]}`, {
          type: format,
        });

        const result = await storage.uploadImage(file);
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('dimensions');
      }
    });

    it('should return image metadata', async () => {
      const file = new File(['image content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await storage.uploadImage(file);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('dimensions');
      expect(typeof result.size).toBe('number');
      expect(typeof result.dimensions.width).toBe('number');
      expect(typeof result.dimensions.height).toBe('number');
    });
  });

  describe('cacheManager', () => {
    it('should set and get cache values', async () => {
      await storage.cacheManager.set('test-key', { data: 'value' });

      const result = await storage.cacheManager.get('test-key');

      expect(result).toEqual({ data: 'value' });
    });

    it('should return null for expired cache', async () => {
      jest.useFakeTimers();

      await storage.cacheManager.set('test-key', { data: 'value' }, 1000);
      jest.advanceTimersByTime(2000);

      const result = await storage.cacheManager.get('test-key');

      expect(result).toBeNull();
      jest.useRealTimers();
    });

    it('should clear cache', async () => {
      await storage.cacheManager.set('key1', { data: 'value1' });
      await storage.cacheManager.set('key2', { data: 'value2' });

      await storage.cacheManager.clear();

      const result1 = await storage.cacheManager.get('key1');
      const result2 = await storage.cacheManager.get('key2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should save post within 50ms', async () => {
      const start = performance.now();
      await storage.savePost(mockPost);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should load post within 50ms', async () => {
      await storage.savePost(mockPost);

      const start = performance.now();
      await storage.loadPost(mockPost.id);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should list 100 posts within 200ms', async () => {
      for (let i = 0; i < 100; i++) {
        await storage.savePost({ ...mockPost, id: `post-${i}` });
      }

      const start = performance.now();
      await storage.listPosts();
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });
});
