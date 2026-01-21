import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <Card className="max-w-md w-full">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <div className="space-y-3">
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </Card>
  </div>
);

const logError = (error, errorInfo) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  // In production, you might want to send this to an error reporting service
  // like Sentry, LogRocket, etc.
};

export const ErrorBoundary = ({ children, fallback: Fallback, onError }) => (
  <ReactErrorBoundary
    FallbackComponent={Fallback || ErrorFallback}
    onError={onError || logError}
    onReset={() => {
      // Clear any error state if needed
      window.location.reload();
    }}
  >
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
