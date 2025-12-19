"use client";

import { useState } from "react";
import { toggleTodo, deleteTodo, updateTodo } from "@/lib/actions/todos";
import { type Priority, PRIORITY_LEVELS } from "@/lib/types/todo";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X } from "lucide-react";
import type { Todo } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const priorityConfig: Record<Priority, { label: string; bgColor: string; textColor: string }> = {
  LOW: { label: "Low", bgColor: "bg-green-500/10", textColor: "text-green-500" },
  MEDIUM: { label: "Med", bgColor: "bg-yellow-500/10", textColor: "text-yellow-500" },
  HIGH: { label: "High", bgColor: "bg-red-500/10", textColor: "text-red-500" },
};

// Helper to safely get priority config (handles null/undefined/invalid values)
function getPriorityConfig(priority: string | null | undefined) {
  const validPriority = PRIORITY_LEVELS.includes(priority as Priority) 
    ? (priority as Priority) 
    : "MEDIUM";
  return priorityConfig[validPriority];
}

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setError(null);
    setIsLoading(true);
    const result = await toggleTodo(todo.id);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsLoading(true);
    const result = await deleteTodo(todo.id);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await updateTodo(todo.id, { title: editTitle.trim() });
    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  }

  function handleCancelEdit() {
    setEditTitle(todo.title);
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="group">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggle}
          disabled={isLoading || isEditing}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
        />

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1"
              disabled={isLoading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveEdit();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleSaveEdit}
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        ) : (
          <>
            <span
              className={cn(
                "flex-1 text-sm",
                todo.completed && "text-muted-foreground line-through"
              )}
            >
              {todo.title}
            </span>

            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium",
                getPriorityConfig(todo.priority).bgColor,
                getPriorityConfig(todo.priority).textColor
              )}
            >
              {getPriorityConfig(todo.priority).label}
            </span>

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
