import React from 'react';
import { Button } from "@/components/ui/button"; // Shadcn Button
import { AlertCircle } from 'lucide-react'; // Icon for error

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
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 m-3">
          <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl max-w-lg w-full text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-3">Oops, algo deu errado!</h2>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro inesperado. Por favor, tente novamente mais tarde ou entre em contato com o suporte.
            </p>
            <details className="mt-4 bg-muted/50 p-3 rounded text-left text-xs">
              <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <div className="flex gap-4 mt-6 justify-center">
              <Button
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Voltar para o início
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
