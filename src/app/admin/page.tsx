import { redirect } from "next/navigation";
import { UsersAdmin } from "@/components/admin/users-admin";
import { DemandsWorkspace } from "@/components/demands/demands-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/demandas");

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <DemandsWorkspace user={user} adminMode />
        <UsersAdmin currentUser={user} />
      </div>
    </AppShell>
  );
}
