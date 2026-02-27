import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlogEditor } from '@/components/editor/BlogEditor';
import * as storageLib from '@/lib/storage';

jest.mock('@/lib/storage');
jest.mock('@/lib/image-handler');

const mockStorageLib = storageLib as jest.Mocked<typeof storageLib>;

describe('BlogEditor Component', () => {
  const mockPost = {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    featuredImage: 'https://example.com/image.jpg',
    tags: ['test'],
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageLib.loadPost.mockResolvedValue(mockPost);
    mockStorageLib.savePost.mockResolvedValue(mockPost);
  });

  describe('Rendering', () => {
    it('should render editor layout with all sections', () => {
      render(<BlogEditor initialPost={mockPost} />);
      
      expect(screen.getByPlaceholderText(/post title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/write your content/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/excerpt/i)).toBeInTheDocument();
    });

    it('should display featured image preview when image is set', () => {
      render(<BlogEditor initialPost={mockPost} />);
      
      const imageElement = screen.getByAltText(/featured image/i);
      expect(imageElement).toHaveAttribute('src', mockPost.featuredImage);
    });

    it('should render publish button in disabled state when content is empty', () => {
      render(<BlogEditor initialPost={{ ...mockPost, content: '', title: '' }} />);
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      expect(publishButton).toBeDisabled();
    });
  });

  describe('Title Editing', () => {
    it('should update title input value on user input', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const titleInput = screen.getByPlaceholderText(/post title/i) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');
      
      expect(titleInput.value).toBe('New Title');
    });

    it('should enforce title character limit (max 200 characters)', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const titleInput = screen.getByPlaceholderText(/post title/i) as HTMLInputElement;
      await user.clear(titleInput);
      
      const longTitle = 'a'.repeat(250);
      await user.type(titleInput, longTitle);
      
      expect(titleInput.value.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Content Editing', () => {
    it('should update content textarea on user input', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const contentInput = screen.getByPlaceholderText(/write your content/i) as HTMLTextAreaElement;
      await user.clear(contentInput);
      await user.type(contentInput, 'New content');
      
      expect(contentInput.value).toBe('New content');
    });

    it('should support markdown formatting shortcuts', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const contentInput = screen.getByPlaceholderText(/write your content/i) as HTMLTextAreaElement;
      contentInput.focus();
      
      await user.keyboard('Ctrl+b');
      expect(contentInput.value).toContain('****');
    });
  });

  describe('Auto-save Functionality', () => {
    it('should trigger auto-save after user stops typing for 2 seconds', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(<BlogEditor initialPost={mockPost} />);
      
      const titleInput = screen.getByPlaceholderText(/post title/i);
      await user.type(titleInput, 'Auto-save test');
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(mockStorageLib.savePost).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    it('should show auto-save indicator during save', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      mockStorageLib.savePost.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPost), 500))
      );
      
      render(<BlogEditor initialPost={mockPost} />);
      
      const titleInput = screen.getByPlaceholderText(/post title/i);
      await user.type(titleInput, 'test');
      
      jest.advanceTimersByTime(2000);
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Image Upload', () => {
    it('should handle featured image upload', async () => {
      const mockImageUrl = 'https://example.com/new-image.jpg';
      mockStorageLib.uploadImage.mockResolvedValue({
        url: mockImageUrl,
        size: 1024,
        dimensions: { width: 1200, height: 630 },
      });
      
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      await user.click(uploadButton);
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByDisplayValue(/featured image/i, { selector: 'input[type="file"]' });
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
          expect(mockStorageLib.uploadImage).toHaveBeenCalled();
        });
      }
    });

    it('should validate image file type', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      await user.click(uploadButton);
      
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByDisplayValue(/featured image/i, { selector: 'input[type="file"]' });
      
      if (input) {
        fireEvent.change(input, { target: { files: [invalidFile] } });
        
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      }
    });
  });

  describe('Publish Workflow', () => {
    it('should enable publish button when required fields are filled', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={{ ...mockPost, content: '', title: '' }} />);
      
      let publishButton = screen.getByRole('button', { name: /publish/i });
      expect(publishButton).toBeDisabled();
      
      const titleInput = screen.getByPlaceholderText(/post title/i);
      const contentInput = screen.getByPlaceholderText(/write your content/i);
      
      await user.type(titleInput, 'Valid Title');
      await user.type(contentInput, 'Valid content');
      
      publishButton = screen.getByRole('button', { name: /publish/i });
      expect(publishButton).not.toBeDisabled();
    });

    it('should call publish handler with correct post data', async () => {
      const mockPublish = jest.fn().mockResolvedValue({ id: '1' });
      const user = userEvent.setup();
      
      render(<BlogEditor initialPost={mockPost} onPublish={mockPublish} />);
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(mockPublish).toHaveBeenCalledWith(
          expect.objectContaining({
            title: mockPost.title,
            content: mockPost.content,
            status: 'published',
          })
        );
      });
    });
  });

  describe('Tags Management', () => {
    it('should add new tag when user enters tag name', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={mockPost} />);
      
      const tagInput = screen.getByPlaceholderText(/add tags/i);
      await user.type(tagInput, 'newtag');
      
      const addButton = screen.getByRole('button', { name: /add tag/i });
      await user.click(addButton);
      
      expect(screen.getByText('newtag')).toBeInTheDocument();
    });

    it('should remove tag when user clicks remove button', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={{ ...mockPost, tags: ['tag1', 'tag2'] }} />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(screen.queryByText('tag1')).not.toBeInTheDocument();
      });
    });

    it('should not allow duplicate tags', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={{ ...mockPost, tags: ['existing'] }} />);
      
      const tagInput = screen.getByPlaceholderText(/add tags/i);
      await user.type(tagInput, 'existing');
      
      const addButton = screen.getByRole('button', { name: /add tag/i });
      await user.click(addButton);
      
      const tagElements = screen.getAllByText('existing');
      expect(tagElements).toHaveLength(1);
    });
  });

  describe('Excerpt Generation', () => {
    it('should auto-generate excerpt from content if not provided', async () => {
      const user = userEvent.setup();
      render(<BlogEditor initialPost={{ ...mockPost, excerpt: '' }} />);
      
      const contentInput = screen.getByPlaceholderText(/write your content/i);
      const longContent = 'This is a long content that should be truncated into an excerpt. '.repeat(5);
      
      await user.clear(contentInput);
      await user.type(contentInput, longContent);
      
      const excerptInput = screen.getByPlaceholderText(/excerpt/i) as HTMLInputElement;
      await waitFor(() => {
        expect(excerptInput.value.length).toBeGreaterThan(0);
        expect(excerptInput.value.length).toBeLessThanOrEqual(160);
      });
    });
  });
});
