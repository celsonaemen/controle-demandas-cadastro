"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";
import type { User, UserRole } from "@/types/domain";

type EditableUser = User & {
  password: string;
};

export function UsersAdmin({ currentUser }: { currentUser: SessionUser }) {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/users");
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Não foi possível carregar usuários.");
      return;
    }

    setUsers((data.users || []).map((user: User) => ({ ...user, password: "" })));
  }

  function updateUser(id: string, patch: Partial<EditableUser>) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  async function saveUser(user: EditableUser) {
    setSavingId(user.id);
    setError("");
    setMessage("");

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: user.nome,
        email: user.email,
        role: user.role,
        ativo: user.ativo,
        password: user.password
      })
    });

    const data = await response.json().catch(() => ({}));
    setSavingId("");

    if (!response.ok) {
      setError(data.error || "Não foi possível salvar usuário.");
      return;
    }

    setUsers((current) => current.map((item) => (item.id === user.id ? { ...data.user, password: "" } : item)));
    setMessage(`Usuário ${data.user.email} atualizado.`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Administração</p>
          <h3 className="flex items-center gap-2 font-bold text-slate-950">
            <Users className="h-5 w-5 text-primary" />
            Usuários cadastrados
          </h3>
        </div>
        <Button type="button" variant="secondary" onClick={loadUsers}>
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3">
        {message && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Nome</th>
                  <th className="px-3 py-3">E-mail</th>
                  <th className="px-3 py-3">Perfil</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Nova senha</th>
                  <th className="px-3 py-3">Criado em</th>
                  <th className="px-3 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-3">
                        <Input value={user.nome} onChange={(event) => updateUser(user.id, { nome: event.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <Input type="email" value={user.email} onChange={(event) => updateUser(user.id, { email: event.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <Select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value as UserRole })} disabled={isSelf}>
                          <option value="solicitante">Solicitante</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </td>
                      <td className="px-3 py-3">
                        <Select value={user.ativo ? "true" : "false"} onChange={(event) => updateUser(user.id, { ativo: event.target.value === "true" })} disabled={isSelf}>
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </Select>
                        {isSelf && <Badge className="mt-2" tone="blue">Você</Badge>}
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="password"
                          placeholder="Deixe vazio para manter"
                          value={user.password}
                          onChange={(event) => updateUser(user.id, { password: event.target.value })}
                        />
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-600">{formatDateTime(user.createdAt)}</td>
                      <td className="px-3 py-3">
                        <Button type="button" size="sm" onClick={() => saveUser(user)} disabled={savingId === user.id}>
                          {savingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Salvar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
