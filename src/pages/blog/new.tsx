import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import BlogPostForm from '../../components/BlogPostForm';

const NewBlogPost: React.FC = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout title="Create New Blog Post">
      <Head>
        <title>Create New Blog Post | Coffee Pourover</title>
        <meta name="description" content="Create a new blog post about coffee brewing techniques, tips, or science." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <BlogPostForm onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default NewBlogPost; 