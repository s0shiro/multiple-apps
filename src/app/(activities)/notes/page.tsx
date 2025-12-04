import { getNotes } from "@/lib/actions/notes";
import { AddNoteForm } from "@/components/notes/add-note-form";
import { NoteList } from "@/components/notes/note-list";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function NotesPage() {
  const { data: notes } = await getNotes();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Markdown Notes</CardTitle>
              <CardDescription>
                {notes.length === 0
                  ? "You have no notes. Create one to get started!"
                  : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <AddNoteForm />
          <NoteList notes={notes} />
        </CardContent>
      </Card>
    </div>
  );
}
