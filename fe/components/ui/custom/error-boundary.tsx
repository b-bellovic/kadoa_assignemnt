"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
				<div className="p-4">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Something went wrong</AlertTitle>
						<AlertDescription>
							An error occurred. Please try refreshing the page or{" "}
							<Button variant="link" className="p-0 h-auto font-medium" asChild>
								<Link href="/login">logging in again</Link>
							</Button>
							.
						</AlertDescription>
					</Alert>
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
				<div className="p-4">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Authentication Error</AlertTitle>
						<AlertDescription>
							There was a problem with your authentication. Please try{" "}
							<Button variant="link" className="p-0 h-auto font-medium" asChild>
								<Link href="/login">logging in again</Link>
							</Button>
							.
						</AlertDescription>
					</Alert>
				</div>
			}
		>
			{children}
		</ErrorBoundary>
	);
}
