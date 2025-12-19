"use client";
import { useState, useMemo } from "react";
import { TodoList } from "@/components/todo/todo-list";
import { Todo } from "@/lib/db/schema";
import { Input } from "../ui/input";

interface Props { todos: Todo[] }

export default function ClientSearch({todos} : Props) {

    const [query, setQuery] = useState("")

    const filteredTodos = useMemo(()=> (todos.filter((t) => t.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()))), [todos, query])


    return (
        <div>
            <Input  type="text"  placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)}/>
            <TodoList todos={filteredTodos}/>
        </div>
    )

  
}