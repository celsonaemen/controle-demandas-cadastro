import { LEGALIZATION_FLAGS } from "@/lib/constants";
import type { DemandFormValues, LegalizationFlags } from "@/types/domain";

export function emptyFlags(): LegalizationFlags {
  return LEGALIZATION_FLAGS.reduce((flags, item) => {
    return { ...flags, [item.key]: false };
  }, {} as LegalizationFlags);
}

export function buildOperationalSummary(input: Partial<DemandFormValues> & { responsavel?: string }) {
  return [
    `EMPRESA: ${input.empresa || "-"}`,
    `CNPJ: ${input.cnpjCpf || "-"}`,
    `SERVIÇO: ${input.tipoServico || "-"}`,
    `OBJETIVO: ${input.objetivo || "-"}`,
    `ÓRGÃO ENVOLVIDO: ${input.orgaoEnvolvido || "-"}`,
    `PRAZO: ${input.prazo || "-"}`,
    `RESPONSÁVEL: ${input.responsavel || "-"}`,
    `PRÓXIMA AÇÃO: ${input.proximaAcao || "-"}`,
    `DOCUMENTOS: ${input.documentosPendentes || "-"}`
  ].join("\n");
}

export function pickLegalizationFlags(input: unknown): LegalizationFlags {
  const raw = typeof input === "object" && input !== null ? input as Record<string, unknown> : {};
  return LEGALIZATION_FLAGS.reduce((flags, item) => {
    return { ...flags, [item.key]: Boolean(raw[item.key]) };
  }, {} as LegalizationFlags);
}
