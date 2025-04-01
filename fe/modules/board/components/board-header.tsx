"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { memo } from "react";

interface BoardHeaderProps {
	onAddColumn: () => void;
}

/**
 * Header component for the Kanban board
 * Displays the board title and the 'Add Column' button
 */
const BoardHeaderComponent = ({ onAddColumn }: BoardHeaderProps) => {
	return (
		<div className="flex justify-between items-center">
			<h2 className="text-xl font-semibold">Your Kanban Board</h2>
			<Button onClick={onAddColumn}>
				<PlusCircle className="mr-2 h-4 w-4" /> Add Column
			</Button>
		</div>
	);
};

/**
 * Memoized version of the BoardHeader component to prevent unnecessary re-renders
 */
export const BoardHeader = memo(BoardHeaderComponent);
