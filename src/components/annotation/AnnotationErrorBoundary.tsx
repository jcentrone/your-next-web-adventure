import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AnnotationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AnnotationErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service if available
    if (window.location.hostname !== 'localhost') {
      // Only log in production
      console.error("Annotation Error Details:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full">
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-destructive">Annotation Error</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Something went wrong with the image annotation. This might be due to:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Image loading issues</li>
                      <li>Canvas initialization problems</li>
                      <li>Browser compatibility issues</li>
                      <li>Network connectivity problems</li>
                    </ul>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Error Details</summary>
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                        <div className="text-destructive">{this.state.error.message}</div>
                        <div className="mt-1 text-muted-foreground whitespace-pre-wrap">
                          {this.state.error.stack}
                        </div>
                      </div>
                    </details>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={this.handleReset}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={this.props.onNavigateHome || (() => window.history.back())}
                      variant="default"
                      size="sm" 
                      className="flex-1"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go Back
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}