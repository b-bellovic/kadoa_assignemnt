"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-700">
            An error occurred. Please try refreshing the page or{" "}
            <Link href="/login" className="underline font-medium">
              logging in again
            </Link>
            .
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Authentication Error</h2>
          <p className="mt-2 text-sm text-red-700">
            There was a problem with your authentication. Please try{" "}
            <Link href="/login" className="underline font-medium">
              logging in again
            </Link>
            .
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
