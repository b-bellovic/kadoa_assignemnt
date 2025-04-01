"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Layout } from "lucide-react";
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
		<div className="flex justify-end items-center border-b p-2">
			<Button
				variant="secondary"
				className="relative group overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-secondary/80 border-dashed border-2"
				onClick={onAddColumn}
			>
				<div className="flex items-center gap-2 px-2">
					<PlusCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
					<span className="font-medium">Add Column</span>
				</div>
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
			</Button>
		</div>
	);
};

/**
 * Memoized version of the BoardHeader component to prevent unnecessary re-renders
 */
export const BoardHeader = memo(BoardHeaderComponent);
