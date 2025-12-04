import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth/auth-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { DeleteAccountButton } from "@/components/auth/delete-account-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center">Activities</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ActivityLink href="/todo" label="To-Do List" />
            <ActivityLink href="/drive" label="Drive" />
            <ActivityLink href="/food" label="Food Review" />
            <ActivityLink href="/pokemon" label="Pokemon" />
            <ActivityLink href="/notes" label="Notes" />
          </div>
        </div>

        <div className="flex gap-4">
          <LogoutButton />
          <DeleteAccountButton />
        </div>
      </main>
    </div>
  );
}

function ActivityLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex h-24 w-32 items-center justify-center rounded-lg border border-border bg-card p-4 text-center font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {label}
    </a>
  );
}
