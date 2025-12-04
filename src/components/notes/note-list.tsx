import { Accordion } from "@/components/ui/accordion";
import { NoteItem } from "./note-item";
import type { Note } from "@/lib/db/schema";
import { FileText } from "lucide-react";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">No notes yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first note above to get started!
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </Accordion>
  );
}
