"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, password })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Não foi possível autenticar.");
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
          <p className="text-sm font-bold uppercase text-[#e0bd62]">Central interna de demandas</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-white">
            Setor de Cadastro e Legalização
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium text-slate-200">
            Formalize solicitações com dados completos, acompanhe prazos e centralize o andamento operacional.
          </p>
        </div>

        <Card className="border-white/20 bg-white/95 shadow-panel backdrop-blur">
          <CardContent className="p-5">
            <div className="mb-5 lg:hidden">
              <img src="/brand/logoalmenara.png" alt="Almenara" className="h-14 w-auto" />
            </div>
            <div className="mb-5">
              <p className="text-sm font-bold uppercase text-slate-500">Setor de Cadastro</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Controle de Demandas</h2>
            </div>
            <div className="mb-5 flex rounded-md bg-slate-100 p-1">
              <button
                type="button"
                className={`min-h-9 flex-1 rounded-md text-sm font-bold ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-600"}`}
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`min-h-9 flex-1 rounded-md text-sm font-bold ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-600"}`}
                onClick={() => setMode("register")}
              >
                Criar acesso
              </button>
            </div>

            <form className="grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {mode === "login" ? "Entrar" : "Criar acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
