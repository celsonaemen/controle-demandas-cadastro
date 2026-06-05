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
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase text-slate-500">Setor de Cadastro</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Controle de Demandas</h1>
        </div>

        <Card>
          <CardContent className="p-5">
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
