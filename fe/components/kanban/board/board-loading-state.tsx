"use client";

import { Button } from "@/components/ui/button";

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
		return (
			<div className="flex justify-center items-center p-8">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<h3 className="text-lg font-medium text-red-600">
					Error loading board
				</h3>
				<p className="mt-2 text-gray-600">Please try refreshing the page</p>
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
