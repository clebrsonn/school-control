import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next'; // Import withTranslation HOC

/**
 * @interface ErrorBoundaryProps
 * Props for the ErrorBoundary component.
 * Includes `children` to render and `t` function from `withTranslation`.
 */
interface ErrorBoundaryProps extends WithTranslation {
  children: React.ReactNode;
}

/**
 * @interface ErrorBoundaryState
 * State for the ErrorBoundary component.
 * Tracks if an error has occurred, the error object, and error information.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary is a React class component that catches JavaScript errors anywhere in its
 * child component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 */
export class ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Initial state of the ErrorBoundary.
   * `hasError` is false, and `error` and `errorInfo` are null.
   */
  state: ErrorBoundaryState = { 
    hasError: false,
    error: null,
    errorInfo: null
  };

  /**
   * A static lifecycle method that is invoked after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * @param {Error} error - The error that was thrown.
   * @returns {ErrorBoundaryState} An object representing the updated state.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  /**
   * A lifecycle method that is invoked after an error has been thrown by a descendant component.
   * It receives two parameters: the error that was thrown, and an object with a `componentStack` key
   * containing information about which component threw the error.
   * Useful for logging errors to an error reporting service.
   * @param {Error} error - The error that was thrown.
   * @param {React.ErrorInfo} errorInfo - An object with a `componentStack` key.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Example: Log the error to an external error reporting service
    // logErrorToMyService(error, errorInfo); 
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    // Also update state to include errorInfo, which might contain component stack.
    this.setState({ errorInfo });
  }

  /**
   * Renders the component.
   * If `hasError` is true, it renders a fallback UI.
   * Otherwise, it renders the children components as usual.
   * @returns {React.ReactNode} The children or the fallback UI.
   */
  render() {
    const { t } = this.props; // Access t function from props

    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary p-4 m-3 border border-danger rounded">
          <h2 className="text-danger">{t('errorBoundary.title')}</h2>
          <p>{t('errorBoundary.message')}</p>
          <details className="mt-3">
            <summary>{t('errorBoundary.detailsSummary')}</summary>
            <pre className="mt-2" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              {t('errorBoundary.buttons.reload')}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.href = '/'} // Consider using React Router's navigation if available
            >
              {t('errorBoundary.buttons.goHome')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap ErrorBoundaryComponent with withTranslation to inject t function
export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
