import React, { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
              Coffee Pourover
            </span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/">
              <span className={`
                nav-link cursor-pointer
                ${router.pathname === '/' 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
                }
              `}>
                Home
              </span>
            </Link>
            
            <Link href="/brewing">
              <span className={`
                nav-link cursor-pointer
                ${router.pathname.startsWith('/brewing') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
                }
              `}>
                Brew
              </span>
            </Link>

            <Link href="/blog">
              <span className={`
                nav-link cursor-pointer
                ${router.pathname.startsWith('/blog') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
                }
              `}>
                Blog
              </span>
            </Link>
            
            <ThemeToggle />
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 page-transition">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">{title}</h1>
        {children}
      </main>
      
      <footer className="container mx-auto px-4 py-6 mt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-500 text-sm dark:text-gray-400">
          &copy; {new Date().getFullYear()} Coffee Pourover App
        </div>
      </footer>
    </div>
  );
};

export default Layout; 