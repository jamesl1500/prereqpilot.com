'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PenTool } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <head>
        <title>Critical Error - PrereqPilot</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Space Mono, monospace' }}>
        {/* Inline AuthHeader since we can't import CSS modules here */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #000',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: 'Space Mono, monospace',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#000',
              textDecoration: 'none',
              padding: '0.75rem 1.25rem',
              border: '2px solid #000',
            }}>
              <PenTool size={24} strokeWidth={2} />
              <span>PREREQPILOT</span>
            </Link>
          </div>
        </header>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '90px 20px 20px',
          textAlign: 'center',
          backgroundColor: '#fff',
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: '#fff',
            padding: '3rem 2rem',
            border: '2px solid #000',
          }}>
            <div style={{
              fontSize: '6rem',
              fontWeight: 900,
              color: '#ef4444',
              lineHeight: 1,
              marginBottom: '1rem',
              fontFamily: 'Space Mono, monospace',
            }}>
              500
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#000',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              Critical Error
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              We encountered a critical error. Please refresh the page or try again later.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: '2px solid #000',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'Space Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '2px solid #000',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontWeight: 600,
                  fontFamily: 'Space Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
