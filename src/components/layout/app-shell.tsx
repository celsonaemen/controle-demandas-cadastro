"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, KanbanSquare, LogOut, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

type AppShellProps = {
  user: SessionUser;
  children: React.ReactNode;
};

const navItems = [
  { href: "/demandas", label: "Demandas", icon: KanbanSquare, admin: false },
  { href: "/nova-demanda", label: "Nova demanda", icon: Plus, admin: false },
  { href: "/admin", label: "Admin", icon: ShieldCheck, admin: true }
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-slate-500">Cadastro e Legalização</p>
              <h1 className="truncate text-lg font-extrabold text-slate-950">
                Controle de Demandas
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems
              .filter((item) => !item.admin || user.role === "admin")
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100",
                      active && "bg-blue-50 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 sm:flex">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">
                {getInitials(user.nome)}
              </div>
              <div className="min-w-0">
                <p className="max-w-36 truncate text-sm font-bold text-slate-900">{user.nome}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {navItems
            .filter((item) => !item.admin || user.role === "admin")
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700",
                    active && "bg-blue-50 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 lg:px-6">{children}</main>
    </div>
  );
}
