import React from "react";
import ErrorMessage from "./ErrorMessage";

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; onReset?: () => void },
    { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null },
> {
    constructor(props:  { children: React.ReactNode; onReset?: () => void }) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorMessage
                    message="Ocorreu um erro inesperado."
                    stackTrace={this.state.error?.stack}
                    onReset={this.handleReset} />
            );
        }
        return this.props.children;
    }
}
