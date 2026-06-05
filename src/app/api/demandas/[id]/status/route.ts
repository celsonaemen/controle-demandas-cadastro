import { NextResponse } from "next/server";
import { deleteDemandAttachments } from "@/lib/attachments";
import { getSession, isAdmin } from "@/lib/auth";
import { STATUS_OPTIONS } from "@/lib/constants";
import { statusDates } from "@/lib/demand-input";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { serializeDemand } from "@/lib/serializers";
import { DemandModel } from "@/models/Demand";
import type { DemandStatus } from "@/types/domain";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Apenas administradores podem alterar status." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "") as DemandStatus;

  if (!STATUS_OPTIONS.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  await connectMongo();
  const demanda = await DemandModel.findById(id);
  if (!demanda) {
    return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
  }

  const before = serializeDemand(demanda.toObject());
  demanda.status = status;
  Object.assign(demanda, statusDates(status));
  await demanda.save();
  const after = serializeDemand(demanda.toObject());

  await logDemandHistory({
    demandaId: id,
    user,
    acao: `Status alterado de "${before.status}" para "${after.status}"`,
    antes: before,
    depois: after
  });

  if (status === "Concluída") {
    const deletedFiles = await deleteDemandAttachments(id);
    if (deletedFiles > 0) {
      await logDemandHistory({
        demandaId: id,
        user,
        acao: `${deletedFiles} arquivo(s) apagado(s) automaticamente ao concluir demanda`
      });
    }
  }

  return NextResponse.json({ demanda: after });
}
