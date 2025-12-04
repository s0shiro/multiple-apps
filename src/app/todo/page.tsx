import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodos } from "@/lib/actions/todos";
import { AddTodoForm } from "@/components/todo/add-todo-form";
import { TodoList } from "@/components/todo/todo-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/actions/auth";

export default async function TodoPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/");
  }

  const { data: todos } = await getTodos();

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Activities
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">To-Do List</CardTitle>
            <CardDescription>
              {totalCount === 0
                ? "You have no todos. Add one to get started!"
                : `${completedCount} of ${totalCount} completed`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <AddTodoForm />
            <TodoList todos={todos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
