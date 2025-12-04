"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { deleteNote, updateNote } from "@/lib/actions/notes";
import { Input } from "@/components/ui/input";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Pencil, X, Save, FileText, ChevronDown, Eye, Code } from "lucide-react";
import type { Note } from "@/lib/db/schema";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsLoading(true);
    const result = await deleteNote(note.id);
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
    const result = await updateNote(note.id, {
      title: editTitle.trim(),
      content: editContent,
    });
    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  }

  function handleCancelEdit() {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
    setError(null);
  }

  function handleStartEdit() {
    setIsEditing(true);
  }

  // Format date nicely
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AccordionItem value={note.id} className="border-b-0">
      <div className="group rounded-lg border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-sm">
        {/* Header */}
        <AccordionTrigger asChild>
          <div
            className="flex w-full cursor-pointer items-center px-4 py-3 [&[data-state=open]_.chevron-icon]:rotate-180"
            role="button"
            tabIndex={isEditing ? -1 : 0}
          >
            {/* Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Title & Meta */}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                className="ml-3 flex-1 font-medium"
                placeholder="Note title..."
                disabled={isLoading}
                autoFocus
              />
            ) : (
              <div className="ml-3 flex flex-1 flex-col items-start gap-0.5 text-left">
                <span className="font-medium leading-tight">{note.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
            )}

            {/* Actions */}
            <div
              className="ml-3 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isLoading}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    disabled={isLoading}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-all hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </button>
                </>
              )}
            </div>

            {/* Chevron */}
            {!isEditing && (
              <ChevronDown className="chevron-icon ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            )}
          </div>
        </AccordionTrigger>

        {/* Content */}
        <AccordionContent className="px-4 pb-4 pt-0">
          <div className="border-t border-border pt-4">
            {isEditing ? (
              <div data-color-mode="light" className="overflow-hidden rounded-md border border-border">
                <MDEditor
                  value={editContent}
                  onChange={(value) => setEditContent(value || "")}
                  height={300}
                  preview="live"
                />
              </div>
            ) : note.content ? (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-3">
                  <TabsTrigger value="preview" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    Raw
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <div
                    data-color-mode="light"
                    className="prose prose-sm max-w-none rounded-md bg-muted/30 p-4"
                  >
                    <MDPreview source={note.content} />
                  </div>
                </TabsContent>
                <TabsContent value="raw">
                  <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-muted/30 p-4 font-mono text-sm">
                    {note.content}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="rounded-md bg-muted/30 p-4">
                <p className="text-muted-foreground italic">
                  No content yet. Click edit to add some.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </AccordionContent>
      </div>
    </AccordionItem>
  );
}
