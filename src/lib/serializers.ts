import type { Demand, DemandHistory, User } from "@/types/domain";

function dateOnly(value: unknown) {
  if (!value) return "";
  return new Date(String(value)).toISOString().slice(0, 10);
}

function dateTime(value: unknown) {
  if (!value) return null;
  return new Date(String(value)).toISOString();
}

function id(value: unknown) {
  return String(value || "");
}

export function serializeUser(record: Record<string, unknown>): User {
  const statusAcesso = record.statusAcesso === "rejeitado"
    ? "rejeitado"
    : record.statusAcesso === "pendente"
      ? "pendente"
      : Boolean(record.ativo)
        ? "aprovado"
        : "pendente";

  return {
    id: id(record._id),
    nome: String(record.nome || ""),
    email: String(record.email || ""),
    role: record.role === "admin" ? "admin" : "solicitante",
    ativo: Boolean(record.ativo),
    statusAcesso,
    cadastroIp: String(record.cadastroIp || ""),
    cadastroUserAgent: String(record.cadastroUserAgent || ""),
    aprovadoEm: dateTime(record.aprovadoEm),
    aprovadoPorNome: String(record.aprovadoPorNome || ""),
    lastAccessAt: dateTime(record.lastAccessAt),
    createdAt: String(dateTime(record.createdAt) || ""),
    updatedAt: String(dateTime(record.updatedAt) || "")
  };
}

export function serializeDemand(record: Record<string, unknown>): Demand {
  return {
    id: id(record._id),
    numero: Number(record.numero || 0),
    empresa: String(record.empresa || ""),
    cnpjCpf: String(record.cnpjCpf || ""),
    solicitante: String(record.solicitante || ""),
    email: String(record.email || ""),
    telefone: String(record.telefone || ""),
    tipoServico: record.tipoServico as Demand["tipoServico"],
    orgaoEnvolvido: String(record.orgaoEnvolvido || ""),
    status: record.status as Demand["status"],
    prioridade: record.prioridade as Demand["prioridade"],
    responsavel: String(record.responsavel || ""),
    prazo: dateOnly(record.prazo),
    objetivo: String(record.objetivo || ""),
    proximaAcao: String(record.proximaAcao || ""),
    observacoes: String(record.observacoes || ""),
    documentosPendentes: String(record.documentosPendentes || ""),
    protocolo: String(record.protocolo || ""),
    dbe: String(record.dbe || ""),
    viabilidade: String(record.viabilidade || ""),
    caminhoPasta: String(record.caminhoPasta || ""),
    flags: record.flags as Demand["flags"],
    resumoOperacional: String(record.resumoOperacional || ""),
    criadoPor: id(record.criadoPor),
    criadoPorNome: String(record.criadoPorNome || ""),
    createdAt: String(dateTime(record.createdAt) || ""),
    updatedAt: String(dateTime(record.updatedAt) || ""),
    concluidaEm: dateTime(record.concluidaEm),
    canceladaEm: dateTime(record.canceladaEm)
  };
}

export function serializeHistory(record: Record<string, unknown>): DemandHistory {
  return {
    id: id(record._id),
    demandaId: id(record.demandaId),
    usuarioId: id(record.usuarioId),
    usuarioNome: String(record.usuarioNome || ""),
    acao: String(record.acao || ""),
    antes: record.antes as Record<string, unknown> | null,
    depois: record.depois as Record<string, unknown> | null,
    createdAt: String(dateTime(record.createdAt) || "")
  };
}
