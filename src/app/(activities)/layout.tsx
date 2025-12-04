import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getAuthenticatedUser } from "@/lib/actions/auth";

export default async function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
    </div>
  );
}
