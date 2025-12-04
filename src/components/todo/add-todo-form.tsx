"use client";

import { useState, useRef, useTransition } from "react";
import { createTodo } from "@/lib/actions/todos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddTodoForm() {
  const [error, setError] = useState<string | null>(null);
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
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
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
      <Button type="submit" disabled={isPending} size="icon">
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add todo</span>
      </Button>
    </form>
  );
}
