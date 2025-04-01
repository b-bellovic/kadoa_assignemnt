"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";

interface BoardLoadingStateProps {
	isLoading: boolean;
	error: unknown | null;
}

/**
 * Component that displays loading and error states for the Kanban board
 */
export function BoardLoadingState({
	isLoading,
	error,
}: BoardLoadingStateProps) {
	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<h3 className="text-lg font-medium text-destructive">
					Error loading board
				</h3>
				<p className="mt-2 text-muted-foreground">Please try refreshing the page</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => window.location.reload()}
				>
					Retry
				</Button>
			</div>
		);
	}

	return null;
}
