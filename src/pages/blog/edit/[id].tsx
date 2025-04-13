import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import BlogPostForm from '../../../components/BlogPostForm';
import { BlogPost } from '../../../utils/blogTypes';
import { getBlogPostBySlug, getAllBlogPosts } from '../../../utils/blogService';

const EditBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const blogPosts = getAllBlogPosts();
      const blogPost = blogPosts.find(post => post.id === id);
      
      if (blogPost) {
        setPost(blogPost);
      } else {
        setError('Post not found');
      }
      
      setLoading(false);
    }
  }, [id]);

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout title="Post Not Found">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/blog')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Post: ${post.title}`}>
      <Head>
        <title>Edit Blog Post | Coffee Pourover</title>
        <meta name="description" content="Edit an existing blog post." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <BlogPostForm post={post} onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default EditBlogPost; 