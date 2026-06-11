"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessRequested, setAccessRequested] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAccessRequested(false);

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, password })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel autenticar.");
      return;
    }

    if (mode === "register" && data.pending) {
      setAccessRequested(true);
      setMode("login");
      setNome("");
      setPassword("");
      return;
    }

    router.push(nextPath || "/demandas");
    router.refresh();
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-65"
        style={{ backgroundImage: "url('/brand/hero-almenara.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e3d2e] via-[#0e3d2e]/88 to-slate-900/20" aria-hidden="true" />
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden max-w-xl lg:block">
          <img src="/brand/logoalmenara.png" alt="Almenara" className="mb-8 h-20 w-auto rounded-md bg-white/90 p-3" />
          <p className="text-sm font-bold uppercase text-[#e0bd62] dark:text-amber-300">Central interna de demandas</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-white dark:text-slate-50">
            Setor de Cadastro e Legalizacao
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium text-slate-200 dark:text-slate-300">
            Formalize solicitacoes com dados completos, acompanhe prazos e centralize o andamento operacional.
          </p>
        </div>

        <Card className="border-white/30 bg-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-900/70">
          <CardContent className="p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0 lg:hidden">
                <img src="/brand/logoalmenara.png" alt="Almenara" className="h-14 w-auto rounded-md bg-white/85 p-2" />
              </div>
              <ThemeToggle className="ml-auto" />
            </div>
            <div className="mb-5">
              <p className="text-sm font-bold uppercase text-[#e0bd62] dark:text-amber-300">Setor de Cadastro</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white dark:text-slate-50">Controle de Demandas</h2>
            </div>
            <div className="mb-5 flex rounded-md border border-white/25 bg-white/15 p-1 dark:border-slate-700 dark:bg-slate-950/30">
              <button
                type="button"
                className={`min-h-9 flex-1 rounded-md text-sm font-bold ${
                  mode === "login"
                    ? "bg-white/90 text-primary shadow-sm dark:bg-slate-100 dark:text-slate-950"
                    : "text-white/80 dark:text-slate-400"
                }`}
                onClick={() => {
                  setMode("login");
                  setAccessRequested(false);
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`min-h-9 flex-1 rounded-md text-sm font-bold ${
                  mode === "register"
                    ? "bg-white/90 text-primary shadow-sm dark:bg-slate-100 dark:text-slate-950"
                    : "text-white/80 dark:text-slate-400"
                }`}
                onClick={() => {
                  setMode("register");
                  setAccessRequested(false);
                }}
              >
                Criar acesso
              </button>
            </div>

            {accessRequested && (
              <div className="mb-5 rounded-md border border-emerald-200/70 bg-emerald-50/90 px-3 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Sua solicitacao de acesso foi enviada ao administrador. Aguarde a aprovacao e depois faca login.</p>
                </div>
              </div>
            )}

            <form className="grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <div className="grid gap-2">
                  <Label className="text-white/90 dark:text-slate-200" htmlFor="nome">
                    Nome
                  </Label>
                  <Input
                    className="border-white/40 bg-white/85 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
                    id="nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-white/90 dark:text-slate-200" htmlFor="email">
                  E-mail
                </Label>
                <Input
                  className="border-white/40 bg-white/85 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/90 dark:text-slate-200" htmlFor="password">
                  Senha
                </Label>
                <Input
                  className="border-white/40 bg-white/85 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {mode === "login" ? "Entrar" : "Criar acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
