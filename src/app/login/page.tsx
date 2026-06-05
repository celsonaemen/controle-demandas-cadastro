import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSession();
  if (user) redirect("/demandas");

  const params = await searchParams;
  return <LoginForm nextPath={params.next || "/demandas"} />;
}
