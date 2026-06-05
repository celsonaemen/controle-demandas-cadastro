"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Save, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";
import type { User, UserAccessStatus, UserRole } from "@/types/domain";

type EditableUser = User & {
  password: string;
};

const accessLabels: Record<UserAccessStatus, string> = {
  pendente: "Aguardando aprovacao",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado"
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

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.statusAcesso === "pendente" && b.statusAcesso !== "pendente") return -1;
      if (a.statusAcesso !== "pendente" && b.statusAcesso === "pendente") return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [users]);

  const pendingCount = users.filter((user) => user.statusAcesso === "pendente").length;

  async function loadUsers() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/users");
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel carregar usuarios.");
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
        statusAcesso: user.statusAcesso,
        password: user.password
      })
    });

    const data = await response.json().catch(() => ({}));
    setSavingId("");

    if (!response.ok) {
      setError(data.error || "Nao foi possivel salvar usuario.");
      return;
    }

    setUsers((current) => current.map((item) => (item.id === user.id ? { ...data.user, password: "" } : item)));
    setMessage(`Usuario ${data.user.email} atualizado.`);
  }

  function setAccessStatus(user: EditableUser, statusAcesso: UserAccessStatus) {
    updateUser(user.id, {
      statusAcesso,
      ativo: statusAcesso === "aprovado"
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Administracao</p>
          <h3 className="flex items-center gap-2 font-bold text-slate-950">
            <Users className="h-5 w-5 text-primary" />
            Usuarios cadastrados
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {pendingCount > 0 ? `${pendingCount} aguardando aprovacao` : "Nenhuma solicitacao pendente"}
          </p>
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
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Nome</th>
                  <th className="px-3 py-3">E-mail</th>
                  <th className="px-3 py-3">Perfil</th>
                  <th className="px-3 py-3">Aprovacao</th>
                  <th className="px-3 py-3">Acesso</th>
                  <th className="px-3 py-3">Nova senha</th>
                  <th className="px-3 py-3">Cadastro</th>
                  <th className="px-3 py-3">Origem</th>
                  <th className="px-3 py-3">Acao</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-3">
                        <Input value={user.nome} onChange={(event) => updateUser(user.id, { nome: event.target.value })} />
                        {isSelf && <Badge className="mt-2" tone="blue">Voce</Badge>}
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
                        <Select
                          value={user.statusAcesso}
                          onChange={(event) => setAccessStatus(user, event.target.value as UserAccessStatus)}
                          disabled={isSelf}
                        >
                          <option value="pendente">Aguardando aprovacao</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="rejeitado">Rejeitado</option>
                        </Select>
                        <AccessBadge status={user.statusAcesso} />
                        {user.aprovadoEm && (
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            Aprovado por {user.aprovadoPorNome || "-"} em {formatDateTime(user.aprovadoEm)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Select
                          value={user.ativo ? "true" : "false"}
                          onChange={(event) => updateUser(user.id, { ativo: event.target.value === "true" })}
                          disabled={isSelf || user.statusAcesso !== "aprovado"}
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </Select>
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
                        <p className="font-semibold text-slate-700">IP: {user.cadastroIp || "-"}</p>
                        <p className="mt-1 max-w-64 truncate text-xs font-semibold text-slate-500" title={user.cadastroUserAgent}>
                          {user.cadastroUserAgent || "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {user.statusAcesso === "pendente" && !isSelf && (
                            <>
                              <Button type="button" size="sm" onClick={() => saveUser({ ...user, statusAcesso: "aprovado", ativo: true })} disabled={savingId === user.id}>
                                <CheckCircle2 className="h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button type="button" size="sm" variant="danger" onClick={() => saveUser({ ...user, statusAcesso: "rejeitado", ativo: false })} disabled={savingId === user.id}>
                                <XCircle className="h-4 w-4" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          <Button type="button" size="sm" variant="secondary" onClick={() => saveUser(user)} disabled={savingId === user.id}>
                            {savingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Salvar
                          </Button>
                        </div>
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

function AccessBadge({ status }: { status: UserAccessStatus }) {
  const tone = status === "aprovado" ? "green" : status === "rejeitado" ? "red" : "yellow";
  return <Badge className="mt-2" tone={tone}>{accessLabels[status]}</Badge>;
}
