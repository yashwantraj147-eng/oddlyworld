import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ODDLYWORLD Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e17',
          color: '#f8fafc',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: 600,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(244, 114, 182, 0.4)',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <h1 style={{ fontSize: 24, color: '#f472b6', marginBottom: 12 }}>✨ Playground Hiccup</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
              ODDLYWORLD encountered an unexpected hiccup while initializing the 3D toybox universe:
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              padding: 12,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#fbbf24',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: 20,
            }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 9999,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Restart Playground
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

