import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth/auth-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { DeleteAccountButton } from "@/components/auth/delete-account-button";
import { WelcomeSection } from "@/components/home/welcome-section";
import { ActivityLink } from "@/components/home/activity-link";

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
        <WelcomeSection email={user.email || ""} />

        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards">
          <h2 className="text-xl font-semibold text-center">Activities</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ActivityLink href="/todo" label="To-Do List" icon="todo" />
            <ActivityLink href="/drive" label="Drive" icon="drive" />
            <ActivityLink href="/food" label="Food Review" icon="food" />
            <ActivityLink href="/pokemon" label="Pokemon" icon="pokemon" />
            <ActivityLink href="/notes" label="Notes" icon="notes" />
          </div>
        </div>

        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-backwards">
          <LogoutButton />
          <DeleteAccountButton />
        </div>
      </main>
    </div>
  );
}
