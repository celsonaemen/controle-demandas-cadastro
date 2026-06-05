import { redirect } from "next/navigation";
import { DemandForm } from "@/components/demands/demand-form";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

type NovaDemandaPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function NovaDemandaPage({ searchParams }: NovaDemandaPageProps) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <AppShell user={user}>
      <DemandForm user={user} demandId={params.id} />
    </AppShell>
  );
}
