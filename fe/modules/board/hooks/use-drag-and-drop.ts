import {
	DragEndEvent,
	DragOverEvent,
	DragStartEvent,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { Column, Task, UpdateTaskParams, UpdateColumnParams } from "../types";
import { useColumnDrag } from "./use-column-drag";
import { useTaskDrag } from "./use-task-drag";

/**
 * Props for the useDragAndDrop hook
 */
interface UseDragAndDropProps {
	columns: Column[];
	tasks: Task[];
	updateTask: (params: UpdateTaskParams) => Promise<void>;
	updateColumn: (params: UpdateColumnParams) => Promise<void>;
	reorderTasks?: (params: { columnId: string; taskIds: string[] }) => void;
	reorderColumns?: (columnIds: string[]) => void;
}

/**
 * Custom hook that provides drag and drop functionality for kanban board
 * Handles reordering tasks within columns and moving tasks between columns
 */
export const useDragAndDrop = ({
	columns,
	tasks,
	updateTask,
	updateColumn,
	reorderTasks,
	reorderColumns,
}: UseDragAndDropProps) => {
	const taskDrag = useTaskDrag({ tasks, updateTask, reorderTasks });
	const columnDrag = useColumnDrag({ columns, updateColumn, reorderColumns });

	const {
		activeTask,
		setActiveTask,
		currentTaskColumnId,
		setCurrentTaskColumnId,
	} = taskDrag;
	const { activeColumn, setActiveColumn } = columnDrag;

	/**
	 * Configure drag and drop sensors with appropriate constraints
	 */
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
	);

	/**
	 * Handles the start of a drag operation
	 * Identifies whether a task or column is being dragged and updates state accordingly
	 */
	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const activeId = active.id.toString();

		// Check if dragging a task
		const draggedTask = tasks.find((task) => task.id === activeId);
		if (draggedTask) {
			setActiveTask(draggedTask);
			setCurrentTaskColumnId(draggedTask.columnId);
			return;
		}

		// Check if dragging a column
		const draggedColumn = columns.find((column) => column.id === activeId);
		if (draggedColumn) {
			setActiveColumn(draggedColumn);
		}
	};

	/**
	 * Handles drag over event to provide visual feedback during dragging
	 */
	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id || !activeTask) return;

		const overId = over.id.toString();

		const overTask = tasks.find((task) => task.id === overId);
		const overColumn = columns.find((column) => column.id === overId);

		if (!overTask && !overColumn) return;

		if (overTask) {
			taskDrag.handleTaskOverTask(active, activeTask, overTask);
		} else if (overColumn) {
			taskDrag.handleTaskOverColumn(active, activeTask, overColumn.id);
		}
	};

	/**
	 * Handles the end of a drag operation
	 * Determines the final position and updates the backend accordingly
	 */
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		setCurrentTaskColumnId(null);

		if (!over) {
			setActiveTask(null);
			setActiveColumn(null);
			return;
		}

		const activeId = active.id.toString();
		const overId = over.id.toString();

		if (activeColumn) {
			await columnDrag.handleColumnReordering(activeId, overId);
			return;
		}

		if (activeTask) {
			const activeTaskItem = tasks.find((task) => task.id === activeId);
			if (!activeTaskItem) {
				setActiveTask(null);
				return;
			}

			const overTaskItem = tasks.find((task) => task.id === overId);
			const overColumn = columns.find((column) => column.id === overId);

			if (overTaskItem) {
				const activeIndex = taskDrag
					.getSortedTasksInColumn(activeTaskItem.columnId)
					.findIndex((task) => task.id === activeId);

				const overIndex = taskDrag
					.getSortedTasksInColumn(overTaskItem.columnId)
					.findIndex((task) => task.id === overId);

				if (activeTaskItem.columnId !== overTaskItem.columnId) {
					await taskDrag.handleTaskMovingColumns(
						activeId,
						activeTaskItem.columnId,
						overTaskItem.columnId,
						overIndex,
					);
				} else {
					await taskDrag.handleTaskReorderingSameColumn(
						activeId,
						activeTaskItem.columnId,
						activeIndex,
						overIndex,
					);
				}
			} else if (overColumn && activeTaskItem.columnId !== overColumn.id) {
				await taskDrag.handleTaskDroppedOnColumn(
					activeId,
					activeTaskItem.columnId,
					overColumn.id,
				);
			}

			setActiveTask(null);
		}
	};

	return {
		activeTask,
		activeColumn,
		currentTaskColumnId,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	};
};
