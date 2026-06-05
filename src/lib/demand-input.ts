import { PRIORITY_OPTIONS, SERVICE_TYPES, STATUS_OPTIONS } from "@/lib/constants";
import { buildOperationalSummary, pickLegalizationFlags } from "@/lib/demand-utils";
import type { DemandFormValues, DemandPriority, DemandStatus, ServiceType } from "@/types/domain";

type RawDemandInput = Partial<DemandFormValues> & Record<string, unknown>;

function text(value: unknown) {
  return String(value || "").trim();
}

function option<T extends string>(value: unknown, options: readonly T[], fallback: T) {
  const normalized = text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return options.find((item) => {
    return item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalized;
  }) || fallback;
}

export function normalizeDemandInput(raw: RawDemandInput, canManage: boolean) {
  const payload = {
    empresa: text(raw.empresa),
    cnpjCpf: text(raw.cnpjCpf),
    solicitante: text(raw.solicitante),
    email: text(raw.email).toLowerCase(),
    telefone: text(raw.telefone),
    tipoServico: option(raw.tipoServico, SERVICE_TYPES, "Outro") as ServiceType,
    orgaoEnvolvido: text(raw.orgaoEnvolvido),
    status: canManage ? option(raw.status, STATUS_OPTIONS, "Recebida") as DemandStatus : "Recebida" as DemandStatus,
    prioridade: option(raw.prioridade, PRIORITY_OPTIONS, "Normal") as DemandPriority,
    responsavel: canManage ? text(raw.responsavel) : "",
    prazo: text(raw.prazo),
    objetivo: text(raw.objetivo),
    proximaAcao: text(raw.proximaAcao),
    observacoes: text(raw.observacoes),
    documentosPendentes: text(raw.documentosPendentes),
    protocolo: text(raw.protocolo),
    dbe: text(raw.dbe),
    viabilidade: text(raw.viabilidade),
    caminhoPasta: text(raw.caminhoPasta),
    flags: pickLegalizationFlags(raw.flags)
  };

  return {
    ...payload,
    resumoOperacional: buildOperationalSummary(payload)
  };
}

export function normalizeAdminDemandInput(raw: RawDemandInput, existing: Record<string, unknown>) {
  const payload = normalizeDemandInput(raw, true);
  return {
    ...payload,
    status: payload.status || existing.status,
    prioridade: payload.prioridade || existing.prioridade,
    responsavel: payload.responsavel
  };
}

export function validateDemandPayload(payload: ReturnType<typeof normalizeDemandInput>) {
  const errors: string[] = [];
  const required: Array<[keyof typeof payload, string]> = [
    ["empresa", "Empresa"],
    ["cnpjCpf", "CNPJ/CPF"],
    ["solicitante", "Solicitante"],
    ["email", "E-mail"],
    ["tipoServico", "Tipo de serviço"],
    ["orgaoEnvolvido", "Órgão envolvido"],
    ["prazo", "Prazo"],
    ["objetivo", "Objetivo"],
    ["proximaAcao", "Próxima ação"]
  ];

  required.forEach(([key, label]) => {
    if (!String(payload[key] || "").trim()) {
      errors.push(`${label} é obrigatório.`);
    }
  });

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("E-mail inválido.");
  }

  if (payload.prazo && Number.isNaN(new Date(payload.prazo).getTime())) {
    errors.push("Prazo inválido.");
  }

  return errors;
}

export function statusDates(status: DemandStatus) {
  return {
    concluidaEm: status === "Concluída" ? new Date() : null,
    canceladaEm: status === "Cancelada" ? new Date() : null
  };
}
