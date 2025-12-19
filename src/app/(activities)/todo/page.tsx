import { getTodos } from "@/lib/actions/todos";
import { AddTodoForm } from "@/components/todo/add-todo-form";
import { TodoList } from "@/components/todo/todo-list";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default async function TodoPage() {
  const { data: todos } = await getTodos();

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;


  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">To-Do List</CardTitle>
              <CardDescription>
                {totalCount === 0
                  ? "You have no todos. Add one to get started!"
                  : `${completedCount} of ${totalCount} completed`}
              </CardDescription>
            </div>
          </div>
          
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <AddTodoForm />
          <TodoList todos={todos} />
           {/* <ClientSearch todos={todos}/> */}
        </CardContent>
      </Card>
    </div>
  );
}
