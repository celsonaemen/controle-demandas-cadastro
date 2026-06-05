import { DemandHistoryModel } from "@/models/DemandHistory";
import type { SessionUser } from "@/lib/session";

type HistoryInput = {
  demandaId: string;
  user: SessionUser;
  acao: string;
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
};

export async function logDemandHistory(input: HistoryInput) {
  return DemandHistoryModel.create({
    demandaId: input.demandaId,
    usuarioId: input.user.id,
    usuarioNome: input.user.nome,
    acao: input.acao,
    antes: input.antes || null,
    depois: input.depois || null
  });
}
