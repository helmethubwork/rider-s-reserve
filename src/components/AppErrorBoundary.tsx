import React, { Component, ErrorInfo, ReactNode } from 'react';
import helmetHubLogo from '@/assets/helmet-hub-logo.png';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#0a0a0a',
            color: '#fafafa',
            textAlign: 'center',
          }}
        >
          <img
            src={helmetHubLogo}
            alt="Helmet Hub"
            style={{ width: 120, height: 'auto', marginBottom: '2rem' }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', maxWidth: 400, lineHeight: 1.6 }}>
            We hit an unexpected error. Please try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#c8ff32',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
