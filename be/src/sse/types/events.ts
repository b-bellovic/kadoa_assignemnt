export enum TaskEventType {
	CREATED = "task.created",
	MOVED = "task.moved",
	UPDATED = "task.updated",
	DELETED = "task.deleted",
	REORDERED = "task.reordered",
	BATCH_REORDERED = "tasks.reordered",
}

export enum ColumnEventType {
	CREATED = "column.created",
	UPDATED = "column.updated",
	DELETED = "column.deleted",
	REORDERED = "column.reordered",
}
