import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BlogPost } from '../utils/blogTypes';
import { createBlogPost, updateBlogPost } from '../utils/blogService';

interface BlogPostFormProps {
  post?: BlogPost; // If provided, we're editing an existing post
  onCancel: () => void;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onCancel }) => {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [author, setAuthor] = useState(post?.author || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (excerpt.length < 50 || excerpt.length > 160) {
      newErrors.excerpt = 'Excerpt should be between 50 and 160 characters';
    }
    
    if (!author.trim()) {
      newErrors.author = 'Author name is required';
    }
    
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (post) {
        // Update existing post
        await updateBlogPost(post.id, {
          title,
          content,
          excerpt,
          author,
          coverImage,
          tags,
          date: new Date().toISOString(), // Update the date on edit
        });
      } else {
        // Create new post
        await createBlogPost({
          title,
          content,
          excerpt,
          author,
          coverImage,
          tags,
          date: new Date().toISOString(),
        });
      }
      
      // Redirect to blog list page
      router.push('/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      setErrors({ submit: 'Failed to save the blog post. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input key press (Enter to add)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="mb-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title || 'Post Title'}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              By {author || 'Author'} • {new Date().toLocaleDateString()}
            </div>
            {coverImage && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img src={coverImage} alt={title} className="w-full h-auto" />
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-gray-600 dark:text-gray-300 italic mb-6">{excerpt}</div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Back to Editing
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
            )}
          </div>

          {/* Cover Image */}
          <div className="mb-4">
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Enter image URL"
              className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {coverImage && (
              <div className="mt-2">
                <img 
                  src={coverImage} 
                  alt="Cover preview" 
                  className="h-32 object-cover rounded-md" 
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags <span className="text-red-600">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyPress}
                placeholder="Enter tag and press Enter"
                className="flex-grow px-3 py-2 border rounded-l-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div className="mb-4">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excerpt <span className="text-red-600">*</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                (50-160 characters)
              </span>
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post"
              rows={2}
              className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="flex justify-between">
              {errors.excerpt ? (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              ) : (
                <span></span>
              )}
              <span className={`text-xs ${
                excerpt.length < 50 || excerpt.length > 160 
                  ? 'text-red-600' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {excerpt.length}/160
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content <span className="text-red-600">*</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                (Supports Markdown)
              </span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={15}
              className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Submit error message */}
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Form actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Saving...' 
                : post 
                  ? 'Update Post' 
                  : 'Publish Post'
              }
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogPostForm; 