import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check if we have preferences stored
                  const prefItem = localStorage.getItem('coffee-pourover-preferences');
                  
                  if (prefItem) {
                    const prefs = JSON.parse(prefItem);
                    const darkMode = prefs.darkMode;
                    
                    if (darkMode) {
                      document.documentElement.classList.add('dark');
                      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#121212');
                    }
                  } else {
                    // For first-time users, check system preference
                    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDarkMode) {
                      document.documentElement.classList.add('dark');
                      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#121212');
                    }
                  }
                } catch (e) {
                  console.error('Error applying initial theme:', e);
                }
              })();
            `
          }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 