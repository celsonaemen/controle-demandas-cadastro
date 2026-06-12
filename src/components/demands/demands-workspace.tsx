"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clipboard, Download, Eye, FileText, Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_OPTIONS, SERVICE_TYPES, STATUS_OPTIONS } from "@/lib/constants";
import { cn, daysUntil, formatCpfCnpj, formatDate, formatDateTime, normalizeSearch } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";
import type { Demand, DemandAttachment, DemandFilters, DemandHistory, DemandStatus } from "@/types/domain";

type DemandsWorkspaceProps = {
  user: SessionUser;
  adminMode?: boolean;
};

const emptyFilters: DemandFilters = {
  company: "",
  document: "",
  responsible: "",
  status: "",
  priority: "",
  service: "",
  dueDate: "",
  createdDate: ""
};

export function DemandsWorkspace({ user, adminMode = false }: DemandsWorkspaceProps) {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [filters, setFilters] = useState<DemandFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Demand | null>(null);
  const [history, setHistory] = useState<DemandHistory[]>([]);
  const [attachments, setAttachments] = useState<DemandAttachment[]>([]);
  const [draggingId, setDraggingId] = useState("");

  useEffect(() => {
    loadDemands();
    const interval = window.setInterval(() => {
      loadDemands({ silent: true });
    }, 12000);
    return () => window.clearInterval(interval);
  }, []);

  async function loadDemands(options?: { silent?: boolean }) {
    if (options?.silent) setRefreshing(true);
    else setLoading(true);

    setError("");
    const response = await fetch("/api/demandas");
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    setRefreshing(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel carregar as demandas.");
      return;
    }

    setDemands(data.demandas || []);
  }

  async function openDetails(demand: Demand) {
    setSelected(demand);
    setHistory([]);
    setAttachments([]);

    const [historyResponse, attachmentsResponse] = await Promise.all([
      fetch(`/api/demandas/${demand.id}/historico`),
      fetch(`/api/demandas/${demand.id}/arquivos`)
    ]);

    const historyData = await historyResponse.json().catch(() => ({}));
    if (historyResponse.ok) setHistory(historyData.historico || []);

    const attachmentsData = await attachmentsResponse.json().catch(() => ({}));
    if (attachmentsResponse.ok) setAttachments(attachmentsData.arquivos || []);
  }

  async function updateStatus(id: string, status: DemandStatus) {
    if (!adminMode) return;

    const response = await fetch(`/api/demandas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Nao foi possivel alterar o status.");
      return;
    }

    setDemands((current) => current.map((demand) => (demand.id === id ? data.demanda : demand)));
  }

  async function deleteDemand(id: string) {
    if (!adminMode) return;
    const confirmed = window.confirm("Excluir esta demanda?");
    if (!confirmed) return;

    const response = await fetch(`/api/demandas/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Nao foi possivel excluir.");
      return;
    }

    setDemands((current) => current.filter((demand) => demand.id !== id));
  }

  async function copySummary(demand: Demand) {
    await navigator.clipboard.writeText(demand.resumoOperacional || "");
  }

  const filteredDemands = useMemo(() => {
    return demands.filter((demand) => {
      const company = normalizeSearch(demand.empresa);
      const document = normalizeSearch(demand.cnpjCpf);
      const responsible = normalizeSearch(demand.responsavel);
      const matchesCompany = !filters.company || company.includes(normalizeSearch(filters.company));
      const matchesDocument = !filters.document || document.includes(normalizeSearch(filters.document));
      const matchesResponsible = !filters.responsible || responsible.includes(normalizeSearch(filters.responsible));
      const matchesStatus = !filters.status || demand.status === filters.status;
      const matchesPriority = !filters.priority || demand.prioridade === filters.priority;
      const matchesService = !filters.service || demand.tipoServico === filters.service;
      const matchesDueDate = !filters.dueDate || demand.prazo === filters.dueDate;
      const matchesCreatedDate = !filters.createdDate || demand.createdAt.slice(0, 10) === filters.createdDate;
      return matchesCompany && matchesDocument && matchesResponsible && matchesStatus && matchesPriority && matchesService && matchesDueDate && matchesCreatedDate;
    });
  }, [demands, filters]);

  const stats = useMemo(() => {
    return {
      total: demands.length,
      vencidas: demands.filter(isOverdue).length,
      recebidas: demands.filter((demand) => demand.status === "Recebida").length,
      emExecucao: demands.filter((demand) => demand.status === "Em execução").length,
      aguardandoCliente: demands.filter((demand) => demand.status === "Aguardando cliente").length,
      aguardandoOrgao: demands.filter((demand) => demand.status === "Aguardando órgão").length,
      concluidas: demands.filter((demand) => demand.status === "Concluída").length
    };
  }, [demands]);

  const responsaveis = useMemo(() => {
    return Array.from(new Set(demands.map((demand) => demand.responsavel).filter(Boolean))).sort();
  }, [demands]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{adminMode ? "Administracao" : "Painel operacional"}</p>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50">{adminMode ? "Gestao das demandas" : "Demandas do setor"}</h2>
        </div>
        <Link href="/nova-demanda">
          <Button type="button">Nova demanda</Button>
        </Link>
      </div>

      {refreshing && <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Atualizando demandas...</p>}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Metric label="Total" value={stats.total} />
        <Metric label="Vencidas" value={stats.vencidas} tone={stats.vencidas > 0 ? "red" : "slate"} />
        <Metric label="Recebidas" value={stats.recebidas} />
        <Metric label="Em execucao" value={stats.emExecucao} />
        <Metric label="Aguardando cliente" value={stats.aguardandoCliente} />
        <Metric label="Aguardando orgao" value={stats.aguardandoOrgao} />
        <Metric label="Concluidas" value={stats.concluidas} tone="green" />
      </section>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <FilterField label="Empresa">
            <Input value={filters.company} onChange={(event) => setFilters({ ...filters, company: event.target.value })} />
          </FilterField>
          <FilterField label="CNPJ/CPF">
            <Input value={filters.document} onChange={(event) => setFilters({ ...filters, document: event.target.value })} />
          </FilterField>
          <FilterField label="Responsavel">
            <Select value={filters.responsible} onChange={(event) => setFilters({ ...filters, responsible: event.target.value })}>
              <option value="">Todos</option>
              {responsaveis.map((responsavel) => (
                <option key={responsavel} value={responsavel}>
                  {responsavel}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Status">
            <Select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Prioridade">
            <Select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
              <option value="">Todas</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Servico">
            <Select value={filters.service} onChange={(event) => setFilters({ ...filters, service: event.target.value })}>
              <option value="">Todos</option>
              {SERVICE_TYPES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Prazo">
            <Input type="date" value={filters.dueDate} onChange={(event) => setFilters({ ...filters, dueDate: event.target.value })} />
          </FilterField>
          <div className="flex items-end">
            <Button className="w-full" type="button" variant="secondary" onClick={() => setFilters(emptyFilters)}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <>
          <DemandMobileList
            demands={filteredDemands}
            adminMode={adminMode}
            onDetails={openDetails}
            onCopy={copySummary}
            onStatus={updateStatus}
            onDelete={deleteDemand}
          />
          <DemandTable
            demands={filteredDemands}
            adminMode={adminMode}
            onDetails={openDetails}
            onCopy={copySummary}
            onStatus={updateStatus}
            onDelete={deleteDemand}
          />
          <KanbanBoard
            demands={filteredDemands}
            adminMode={adminMode}
            draggingId={draggingId}
            onDrag={setDraggingId}
            onDrop={updateStatus}
            onDetails={openDetails}
            onCopy={copySummary}
          />
        </>
      )}

      {selected && (
        <DetailsModal
          demand={selected}
          history={history}
          attachments={attachments}
          adminMode={adminMode}
          onHistoryAdded={(item) => setHistory((current) => [item, ...current])}
          onProgressSaved={() => loadDemands({ silent: true })}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function DemandMobileList({
  demands,
  adminMode,
  onDetails,
  onCopy,
  onStatus,
  onDelete
}: {
  demands: Demand[];
  adminMode: boolean;
  onDetails: (demand: Demand) => void;
  onCopy: (demand: Demand) => void;
  onStatus: (id: string, status: DemandStatus) => void;
  onDelete: (id: string) => void;
}) {
  if (!demands.length) {
    return (
      <Card className="md:hidden">
        <CardContent className="py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          Nenhuma demanda encontrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {demands.map((demand) => (
        <Card key={demand.id} className={cn(isOverdue(demand) && "border-red-200 dark:border-red-900/60")}>
          <CardContent className="grid gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold text-slate-950 dark:text-slate-50">{demand.empresa}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{demand.tipoServico}</p>
              </div>
              <Badge tone="slate">#{demand.numero}</Badge>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <PriorityBadge priority={demand.prioridade} />
              <StatusBadge status={demand.status} />
            </div>

            <div className="grid gap-1 text-sm">
              <p className="font-semibold text-slate-700 dark:text-slate-200">CNPJ/CPF: {formatCpfCnpj(demand.cnpjCpf)}</p>
              <p className={cn("font-semibold text-slate-700 dark:text-slate-200", isOverdue(demand) && "text-red-700 dark:text-red-300")}>
                Prazo: {formatDate(demand.prazo)}
              </p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Responsavel: {demand.responsavel || "-"}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Proxima acao: {demand.proximaAcao || "-"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => onDetails(demand)}>
                <Eye className="h-3.5 w-3.5" />
                Ver
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => onCopy(demand)}>
                <Clipboard className="h-3.5 w-3.5" />
                Copiar
              </Button>
              {adminMode && (
                <>
                  <Button type="button" size="sm" variant="secondary" onClick={() => onStatus(demand.id, "Concluída")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Concluir
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => onDelete(demand.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DemandTable({
  demands,
  adminMode,
  onDetails,
  onCopy,
  onStatus,
  onDelete
}: {
  demands: Demand[];
  adminMode: boolean;
  onDetails: (demand: Demand) => void;
  onCopy: (demand: Demand) => void;
  onStatus: (id: string, status: DemandStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="hidden md:block">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <h3 className="font-bold text-slate-950 dark:text-slate-50">Tabela de demandas</h3>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{demands.length} registros</span>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <Th>Número</Th>
              <Th>Empresa</Th>
              <Th>CNPJ</Th>
              <Th>Servico</Th>
              <Th>Responsavel</Th>
              <Th>Status</Th>
              <Th>Prioridade</Th>
              <Th>Prazo</Th>
              <Th>Cadastro</Th>
              <Th>Atualizacao</Th>
              <Th>Acao</Th>
            </tr>
          </thead>
          <tbody>
            {demands.map((demand) => (
              <tr key={demand.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                <Td>#{demand.numero}</Td>
                <Td className="font-bold text-slate-950 dark:text-slate-50">{demand.empresa}</Td>
                <Td>{formatCpfCnpj(demand.cnpjCpf)}</Td>
                <Td>{demand.tipoServico}</Td>
                <Td>{demand.responsavel || "-"}</Td>
                <Td>
                  {adminMode ? (
                    <Select value={demand.status} onChange={(event) => onStatus(demand.id, event.target.value as DemandStatus)}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <StatusBadge status={demand.status} />
                  )}
                </Td>
                <Td>
                  <PriorityBadge priority={demand.prioridade} />
                </Td>
                <Td className={isOverdue(demand) ? "font-bold text-red-700 dark:text-red-300" : ""}>{formatDate(demand.prazo)}</Td>
                <Td>{formatDate(demand.createdAt)}</Td>
                <Td>{formatDateTime(demand.updatedAt)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <Button type="button" size="sm" variant="secondary" onClick={() => onDetails(demand)}>
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => onCopy(demand)}>
                      <Clipboard className="h-3.5 w-3.5" />
                      Copiar
                    </Button>
                    {adminMode && (
                      <>
                        <Link href={`/nova-demanda?id=${demand.id}`}>
                          <Button type="button" size="sm" variant="secondary">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                        <Button type="button" size="sm" variant="secondary" onClick={() => onStatus(demand.id, "Concluída")}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Concluir
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => onDelete(demand.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function KanbanBoard({
  demands,
  adminMode,
  draggingId,
  onDrag,
  onDrop,
  onDetails,
  onCopy
}: {
  demands: Demand[];
  adminMode: boolean;
  draggingId: string;
  onDrag: (id: string) => void;
  onDrop: (id: string, status: DemandStatus) => void;
  onDetails: (demand: Demand) => void;
  onCopy: (demand: Demand) => void;
}) {
  return (
    <section className="grid gap-3">
      <div>
        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Kanban</p>
        <h3 className="text-xl font-extrabold text-slate-950 dark:text-slate-50">Demandas por status</h3>
      </div>
      <div className="kanban-scroll grid auto-cols-[280px] grid-flow-col gap-3 overflow-x-auto pb-3 sm:auto-cols-[300px] lg:auto-cols-[320px]">
        {STATUS_OPTIONS.map((status) => {
          const items = demands.filter((demand) => demand.status === status);
          return (
            <div
              key={status}
              className="min-h-[420px] rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
              onDragOver={(event) => adminMode && event.preventDefault()}
              onDrop={() => draggingId && onDrop(draggingId, status)}
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
                <h4 className="font-bold text-slate-950 dark:text-slate-50">{status}</h4>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-primary dark:bg-blue-950/60 dark:text-blue-200">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-2 p-2">
                {items.length === 0 && (
                  <div className="grid min-h-24 place-items-center rounded-md border border-dashed border-slate-300 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    Sem demandas
                  </div>
                )}
                {items.map((demand) => (
                  <article
                    key={demand.id}
                    draggable={adminMode}
                    onDragStart={() => onDrag(demand.id)}
                    className={cn(
                      "grid gap-2 rounded-md border bg-white p-3 shadow-sm dark:bg-slate-950",
                      isOverdue(demand) ? "border-red-200 dark:border-red-900/60" : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-950 dark:text-slate-50">{demand.empresa}</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{demand.tipoServico}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <PriorityBadge priority={demand.prioridade} />
                      <StatusBadge status={demand.status} />
                    </div>
                    <dl className="grid gap-1 text-xs">
                      <Meta label="Prazo" value={formatDate(demand.prazo)} danger={isOverdue(demand)} />
                      <Meta label="Resp." value={demand.responsavel || "-"} />
                      <Meta label="Acao" value={demand.proximaAcao || "-"} />
                    </dl>
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" size="sm" variant="secondary" onClick={() => onDetails(demand)}>
                        Ver
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => onCopy(demand)}>
                        Copiar
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DetailsModal({
  demand,
  history,
  attachments,
  adminMode,
  onHistoryAdded,
  onProgressSaved,
  onClose
}: {
  demand: Demand;
  history: DemandHistory[];
  attachments: DemandAttachment[];
  adminMode: boolean;
  onHistoryAdded: (item: DemandHistory) => void;
  onProgressSaved: () => void;
  onClose: () => void;
}) {
  const [internalProgress, setInternalProgress] = useState("");
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState("");

  async function saveInternalProgress() {
    const comentario = internalProgress.trim();
    if (!comentario) {
      setProgressError("Informe o andamento antes de salvar.");
      return;
    }

    setProgressSaving(true);
    setProgressError("");

    const response = await fetch(`/api/demandas/${demand.id}/historico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentario })
    });
    const data = await response.json().catch(() => ({}));
    setProgressSaving(false);

    if (!response.ok) {
      setProgressError(data.error || "Nao foi possivel registrar o andamento.");
      return;
    }

    if (data.historico) onHistoryAdded(data.historico);
    setInternalProgress("");
    onProgressSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <aside className="h-full w-full overflow-y-auto bg-white shadow-panel dark:bg-slate-950 md:max-w-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Detalhes</p>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-slate-50">{demand.empresa}</h3>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-white dark:bg-slate-900">{demand.resumoOperacional}</pre>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Numero" value={`#${demand.numero}`} />
            <Info label="CNPJ/CPF" value={formatCpfCnpj(demand.cnpjCpf)} />
            <Info label="Servico" value={demand.tipoServico} />
            <Info label="Orgao" value={demand.orgaoEnvolvido} />
            <Info label="Status" value={demand.status} />
            <Info label="Prioridade" value={demand.prioridade} />
            <Info label="Responsavel" value={demand.responsavel || "-"} />
            <Info label="Prazo" value={formatDate(demand.prazo)} />
            <Info label="Objetivo" value={demand.objetivo} wide />
            <Info label="Proxima acao" value={demand.proximaAcao} wide />
            <Info label="Observacoes" value={demand.observacoes || "-"} wide />
            <Info label="Documentos" value={demand.documentosPendentes || "-"} wide />
          </div>

          <Card>
            <CardHeader>
              <h4 className="font-bold text-slate-950 dark:text-slate-50">Arquivos anexados</h4>
            </CardHeader>
            <CardContent className="grid gap-3">
              {attachments.length === 0 && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Nenhum arquivo anexado. Ao concluir a demanda, os arquivos existentes sao apagados automaticamente.
                </p>
              )}
              {attachments.map((file) => (
                <div key={file.id} className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-slate-50">{file.nome}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {(file.tamanho / 1024 / 1024).toFixed(2)} MB - enviado por {file.enviadoPorNome || "-"} em {formatDateTime(file.createdAt)}
                    </p>
                  </div>
                  <a href={`/api/demandas/${demand.id}/arquivos/${file.id}`} target="_blank" rel="noreferrer">
                    <Button type="button" size="sm" variant="secondary">
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </Button>
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          {adminMode && (
            <Card>
              <CardHeader>
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-slate-950 dark:text-slate-50">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Andamento interno
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Visivel somente para administradores/executores.</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {progressError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                    {progressError}
                  </div>
                )}
                <Textarea
                  maxLength={2000}
                  placeholder="Registre o que foi feito, retorno do cliente, pendencia interna, protocolo consultado ou proxima tratativa."
                  value={internalProgress}
                  onChange={(event) => setInternalProgress(event.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{internalProgress.trim().length}/2000 caracteres</span>
                  <Button type="button" onClick={saveInternalProgress} disabled={progressSaving}>
                    {progressSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    Salvar andamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h4 className="font-bold text-slate-950 dark:text-slate-50">Historico</h4>
            </CardHeader>
            <CardContent className="grid gap-3">
              {history.length === 0 && <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sem historico registrado.</p>}
              {history.map((item) => {
                const comentario = getHistoryComment(item);
                return (
                  <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-950 dark:text-slate-50">{item.acao}</p>
                    {comentario && <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-800 dark:text-slate-200">{comentario}</p>}
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {formatDateTime(item.createdAt)} - {item.usuarioNome}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {adminMode && (
            <Link href={`/nova-demanda?id=${demand.id}`}>
              <Button type="button" className="w-full" variant="secondary">
                Editar demanda
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

function getHistoryComment(item: DemandHistory) {
  const comentario = item.depois?.comentario;
  return typeof comentario === "string" ? comentario : "";
}

function Metric({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "green" | "red" | "slate" }) {
  return (
    <Card
      className={cn(
        "dark:bg-slate-900",
        tone === "red" && "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30",
        tone === "green" && "border-green-200 bg-green-50 dark:border-emerald-900/60 dark:bg-emerald-950/30"
      )}
    >
      <CardContent className="p-4">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
        <strong className="mt-2 block text-3xl font-extrabold text-slate-950 dark:text-slate-50">{value}</strong>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-3 font-bold">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 text-slate-700 dark:text-slate-200", className)}>{children}</td>;
}

function StatusBadge({ status }: { status: DemandStatus }) {
  const tone = status === "Concluída" ? "green" : status === "Cancelada" ? "red" : status.startsWith("Aguardando") ? "yellow" : "blue";
  return <Badge tone={tone}>{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: Demand["prioridade"] }) {
  const tone = priority === "Alta" ? "red" : priority === "Baixa" ? "green" : priority === "Normal" ? "blue" : "yellow";
  return <Badge tone={tone}>{priority}</Badge>;
}

function Meta({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="grid grid-cols-[54px_1fr] gap-2">
      <dt className="font-bold text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={cn("min-w-0 break-words font-semibold text-slate-700 dark:text-slate-200", danger && "text-red-700 dark:text-red-300")}>{value}</dd>
    </div>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900", wide && "sm:col-span-2")}>
      <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function isOverdue(demand: Demand) {
  const days = daysUntil(demand.prazo);
  return days !== null && days < 0 && demand.status !== "Concluída" && demand.status !== "Cancelada";
}
