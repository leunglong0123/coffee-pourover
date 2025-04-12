import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { PreferencesProvider } from '../context/PreferencesContext';
import { TimerProvider } from '../context/TimerContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  // Load debug utilities in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('../utils/debug').catch(console.error);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <title>Coffee Pourover Timer</title>
        <meta 
          name="description" 
          content="A precision timer for brewing the perfect cup of pour-over coffee with step-by-step guidance." 
        />
      </Head>
      <PreferencesProvider>
        <ThemeProvider>
          <TimerProvider>
            <Component {...pageProps} />
          </TimerProvider>
        </ThemeProvider>
      </PreferencesProvider>
    </>
  );
};

export default MyApp; 