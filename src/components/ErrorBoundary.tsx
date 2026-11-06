import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-ink text-foam flex items-center justify-center p-6 text-center"
          style={{ backgroundColor: '#07131F', color: '#F5F7F6' }}
        >
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-serif text-brass" style={{ color: '#D4AF63' }}>
              Yükleme Hatası
            </h1>
            <p className="text-sm text-foam/70" style={{ color: 'rgba(245, 247, 246, 0.7)' }}>
              Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-brass text-ink font-medium text-sm hover:bg-brass-400 transition-colors"
              style={{ backgroundColor: '#D4AF63', color: '#07131F' }}
            >
              Yeniden Yükle
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
