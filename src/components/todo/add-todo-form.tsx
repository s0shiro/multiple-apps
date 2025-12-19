"use client";

import { useState, useRef, useTransition } from "react";
import { createTodo } from "@/lib/actions/todos";
import { PRIORITY_LEVELS, type Priority } from "@/lib/types/todo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-green-500" },
  MEDIUM: { label: "Medium", color: "text-yellow-500" },
  HIGH: { label: "High", color: "text-red-500" },
};

export function AddTodoForm() {
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await createTodo(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      formRef.current?.reset();
      setPriority("MEDIUM");
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <input type="hidden" name="priority" value={priority} />
      <div className="flex-1">
        <Input
          type="text"
          name="title"
          placeholder="Add a new todo..."
          disabled={isPending}
          aria-invalid={!!error}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
      <Select
        value={priority}
        onValueChange={(value) => setPriority(value as Priority)}
        disabled={isPending}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              <span className={priorityConfig[level].color}>
                {priorityConfig[level].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isPending} size="icon">
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add todo</span>
      </Button>
    </form>
  );
}
