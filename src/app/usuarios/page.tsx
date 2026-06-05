import { redirect } from "next/navigation";
import { UsersAdmin } from "@/components/admin/users-admin";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

export default async function UsuariosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/demandas");

  return (
    <AppShell user={user}>
      <UsersAdmin currentUser={user} />
    </AppShell>
  );
}
