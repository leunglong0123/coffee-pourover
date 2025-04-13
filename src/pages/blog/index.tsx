import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '../../components/Layout';
import BlogPostCard from '../../components/BlogPostCard';
import { getAllBlogPosts, getBlogPostsByTag, searchBlogPosts } from '../../utils/blogService';
import { BlogPost } from '../../utils/blogTypes';

interface BlogIndexProps {
  initialPosts: BlogPost[];
  allTags: string[];
}

const BlogIndex: React.FC<BlogIndexProps> = ({ initialPosts, allTags }) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const postsPerPage = 6;

  // Update posts when browser-side data is available
  useEffect(() => {
    // If no filter is applied, get all posts
    if (!selectedTag && !searchQuery) {
      setPosts(getAllBlogPosts());
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedTag(null);
    setPage(1);
    
    if (query.trim()) {
      setPosts(searchBlogPosts(query));
    } else {
      setPosts(getAllBlogPosts());
    }
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // Deselect the tag
      setSelectedTag(null);
      setSearchQuery('');
      setPosts(getAllBlogPosts());
    } else {
      setSelectedTag(tag);
      setSearchQuery('');
      setPage(1);
      setPosts(getBlogPostsByTag(tag));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTag(null);
    setSearchQuery('');
    setPosts(getAllBlogPosts());
    setPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginatedPosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage);

  return (
    <Layout title="Coffee Brewing Blog">
      <Head>
        <title>Coffee Brewing Blog | Coffee Pourover</title>
        <meta name="description" content="Learn about coffee brewing techniques, tips, and science to improve your coffee game." />
        <meta property="og:title" content="Coffee Brewing Blog | Coffee Pourover" />
        <meta property="og:description" content="Learn about coffee brewing techniques, tips, and science to improve your coffee game." />
        <meta property="og:url" content="https://coffeepourover.com/blog" />
        <link rel="canonical" href="https://coffeepourover.com/blog" />
      </Head>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search blog posts..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {(selectedTag || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center ml-auto"
            >
              Clear filters
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-1">
            Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `No posts matching "${searchQuery}"`
                : selectedTag
                ? `No posts with the tag "${selectedTag}"`
                : 'There are no blog posts available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`p-2 rounded-md ${
                      page === 1
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`w-9 h-9 rounded-md ${
                        page === idx + 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`p-2 rounded-md ${
                      page === totalPages
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllBlogPosts();
  
  // Extract all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags))
  ).sort();

  return {
    props: {
      initialPosts: posts,
      allTags,
    },
    // Revalidate the page every 60 seconds
    revalidate: 60,
  };
};

export default BlogIndex; 