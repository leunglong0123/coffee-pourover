import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../../components/Layout';
import BlogPostCard from '../../components/BlogPostCard';
import { 
  getBlogPostBySlug, 
  getAllBlogPosts, 
  getRelatedBlogPosts 
} from '../../utils/blogService';
import { BlogPost, generateBlogStructuredData } from '../../utils/blogTypes';
import ReactMarkdown from 'react-markdown';

interface BlogPostProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const BlogPostPage: React.FC<BlogPostProps> = ({ post, relatedPosts }) => {
  if (!post) {
    return (
      <Layout title="Post Not Found">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <button className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors">
              Back to Blog
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate JSON-LD structured data
  const structuredData = generateBlogStructuredData(post, 'https://coffeepourover.com');

  return (
    <Layout title={post.title}>
      <Head>
        <title>{post.title} | Coffee Pourover</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://coffeepourover.com/blog/${post.slug}`} />
        {post.coverImage && (
          <meta property="og:image" content={post.coverImage} />
        )}
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        {post.tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <link rel="canonical" href={`https://coffeepourover.com/blog/${post.slug}`} />
        
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Back to blog link */}
        <div className="mb-6">
          <Link href="/blog">
            <button className="flex items-center text-primary-700 dark:text-primary-400 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </button>
          </Link>
        </div>

        {/* Post header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
            <span className="mr-4">{formattedDate}</span>
            <span className="mr-4">·</span>
            <span>{post.readingTime} min read</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link href={`/blog?tag=${encodeURIComponent(tag)}`} key={tag}>
                <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
          
          {post.coverImage && (
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-auto" 
              />
            </div>
          )}
        </div>

        {/* Post content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
          <ReactMarkdown>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Social sharing */}
        <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 mb-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Share this article
          </h3>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://coffeepourover.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-400 hover:bg-primary-500 transition-colors text-white"
              aria-label="Share on Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://coffeepourover.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors text-white"
              aria-label="Share on Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://coffeepourover.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-800 hover:bg-primary-900 transition-colors text-white"
              aria-label="Share on LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
              </svg>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://coffeepourover.com/blog/${post.slug}`);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
              aria-label="Copy link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Author info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            About the Author
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {post.author} is a coffee enthusiast and brewing expert with a passion for sharing knowledge about the perfect brew.
          </p>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllBlogPosts();
  
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));
  
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      notFound: true,
    };
  }
  
  const relatedPosts = getRelatedBlogPosts(post.id);
  
  return {
    props: {
      post,
      relatedPosts,
    },
    revalidate: 60, // Revalidate the page every 60 seconds
  };
};

export default BlogPostPage; 