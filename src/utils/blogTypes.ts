export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  readingTime: number; // in minutes
  relatedPosts?: string[]; // IDs of related posts
}

export interface BlogPostMetadata {
  title: string; // 50-60 characters
  description: string; // 150-160 characters
  canonicalUrl: string;
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
}

// JSON-LD structured data for blog posts
export interface BlogPostStructuredData {
  "@context": string;
  "@type": string;
  headline: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": string;
    name: string;
  };
  publisher: {
    "@type": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  mainEntityOfPage: {
    "@type": string;
    "@id": string;
  };
  description: string;
}

export const generateBlogStructuredData = (post: BlogPost, siteUrl: string): BlogPostStructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [post.coverImage],
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author
    },
    publisher: {
      "@type": "Organization",
      name: "Coffee Pourover",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    },
    description: post.excerpt
  };
};

// Helper function to estimate reading time
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Helper function to generate a slug from a title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}; 