"use client";

import { Typewriter } from "@/components/ui/typewriter";

interface WelcomeSectionProps {
  email: string;
}

export function WelcomeSection({ email }: WelcomeSectionProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        <Typewriter text="Welcome back!" speed={80} />
      </h1>
      <p className="mt-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700 fill-mode-backwards">
        Signed in as {email}
      </p>
    </div>
  );
}
