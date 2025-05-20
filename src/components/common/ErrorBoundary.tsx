import React from 'react';

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  state = { 
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 m-3 border border-danger rounded">
          <h2 className="text-danger">Oops, algo deu errado!</h2>
          <p>Ocorreu um erro inesperado. Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
          <details className="mt-3">
            <summary>Detalhes técnicos (para desenvolvedores)</summary>
            <p className="mt-2">{this.state.error && (this.state.error as Error).toString()}</p>
            <p className="mt-2">
              {this.state.errorInfo && (this.state.errorInfo as React.ErrorInfo).componentStack}
            </p>
          </details>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
