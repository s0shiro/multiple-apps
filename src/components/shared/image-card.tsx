"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ActionResult = { success: true } | { success: false; error: string };

interface BaseImageData {
  id: string;
  name: string;
  url: string;
  size: string | null;
  createdAt: Date;
}

interface ImageCardProps<T extends BaseImageData> {
  item: T;
  onDelete: (id: string) => Promise<ActionResult>;
  onUpdate: (id: string, data: { name: string }) => Promise<ActionResult>;
  deleteDialogTitle?: string;
  deleteDialogDescription?: string;
  imageOverlay?: ReactNode;
  imageWrapper?: (children: ReactNode) => ReactNode;
}

export function ImageCard<T extends BaseImageData>({
  item,
  onDelete,
  onUpdate,
  deleteDialogTitle = "Delete Item",
  deleteDialogDescription,
  imageOverlay,
  imageWrapper,
}: ImageCardProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsLoading(true);
    const result = await onDelete(item.id);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await onUpdate(item.id, { name: editName.trim() });
    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  }

  function handleCancelEdit() {
    setEditName(item.name);
    setIsEditing(false);
    setError(null);
  }

  function formatFileSize(bytes: string | null): string {
    if (!bytes) return "Unknown size";
    const size = parseInt(bytes, 10);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  const defaultDeleteDescription = `Are you sure you want to delete "${item.name}"? This action cannot be undone.`;

  const imageContent = (
    <div className="relative aspect-square overflow-hidden bg-muted">
      <Image
        src={item.url}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      {imageOverlay && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {imageOverlay}
        </div>
      )}
    </div>
  );

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      {imageWrapper ? imageWrapper(imageContent) : imageContent}
      <CardContent className="p-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 flex-1 text-sm"
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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium">{item.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(item.size)} •{" "}
                <span suppressHydrationWarning>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {deleteDialogDescription || defaultDeleteDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
