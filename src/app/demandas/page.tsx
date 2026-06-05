import { redirect } from "next/navigation";
import { DemandsWorkspace } from "@/components/demands/demands-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

export default async function DemandasPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <DemandsWorkspace user={user} />
    </AppShell>
  );
}
