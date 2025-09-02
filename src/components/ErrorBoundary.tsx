import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

type ErrorFallbackProps = {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
};

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetError 
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-sm bg-muted p-3 rounded border">
            <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1 overflow-x-auto">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={resetError} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          If this error persists, please contact support with the error details above.
        </p>
      </CardContent>
    </Card>
  </div>
);

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { 
    hasError: false, 
    error: null, 
    errorInfo: null 
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;