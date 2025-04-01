"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { Column, Task } from "../types";
import TaskCard from "./task-card";

interface DragOverlayContentProps {
	activeTask: Task | null;
	activeColumn: Column | null;
}

/**
 * Component that renders the appropriate content for the drag overlay
 * Shows either a task card or a column card based on what's being dragged
 */
const DragOverlayContentComponent = ({
	activeTask,
	activeColumn,
}: DragOverlayContentProps) => {
	if (!activeTask && !activeColumn) {
		return null;
	}

	return (
		<>
			{activeTask && (
				<div
					className="w-[300px] pointer-events-none"
					style={{ transformOrigin: "0 0" }}
				>
					<TaskCard task={activeTask} />
				</div>
			)}

			{activeColumn && (
				<div
					className="w-[300px] pointer-events-none"
					style={{ transformOrigin: "0 0" }}
				>
					<Card className="border border-muted bg-card h-24">
						<CardHeader className="p-3 flex flex-row items-center space-y-0">
							<CardTitle className="text-sm flex-1 text-foreground">
								{activeColumn.title}
							</CardTitle>
						</CardHeader>
					</Card>
				</div>
			)}
		</>
	);
};

/**
 * Memoized version of the DragOverlayContent component to prevent unnecessary re-renders
 */
export const DragOverlayContent = memo(DragOverlayContentComponent);
