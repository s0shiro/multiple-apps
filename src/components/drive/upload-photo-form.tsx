"use client";

import { useState, useRef, useTransition } from "react";
import { uploadPhoto } from "@/lib/actions/photos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, ImagePlus } from "lucide-react";

export function UploadPhotoForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreview(url);
      setError(null);
    }
  }

  function clearSelection() {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    startTransition(async () => {
      const result = await uploadPhoto(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Reset form
      formRef.current?.reset();
      clearSelection();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="file">Select Image</Label>
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isPending}
            className="cursor-pointer"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Photo Name (optional)</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="Enter a name for the photo..."
            disabled={isPending}
            defaultValue={selectedFile?.name.replace(/\.[^/.]+$/, "") || ""}
            key={selectedFile?.name}
          />
        </div>
        <Button type="submit" disabled={isPending || !selectedFile}>
          <Upload className="mr-2 h-4 w-4" />
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {preview && (
        <div className="relative mt-4 inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-h-32 rounded-lg border border-border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -right-2 -top-2"
            onClick={clearSelection}
            disabled={isPending}
          >
            ×
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
