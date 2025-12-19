// Priority levels for todos
export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof PRIORITY_LEVELS)[number];
