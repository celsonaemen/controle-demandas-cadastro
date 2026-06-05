import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { normalizeAdminDemandInput, statusDates, validateDemandPayload } from "@/lib/demand-input";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { serializeDemand } from "@/lib/serializers";
import { DemandModel } from "@/models/Demand";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  await connectMongo();
  const demanda = await DemandModel.findById(id).lean();
  if (!demanda) {
    return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ demanda: serializeDemand(demanda) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  await connectMongo();
  const current = await DemandModel.findById(id);
  if (!current) {
    return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
  }

  const before = serializeDemand(current.toObject());

  if (!isAdmin(user)) {
    current.observacoes = String(body.observacoes || current.observacoes || "").trim();
    current.resumoOperacional = before.resumoOperacional;
    await current.save();
    await logDemandHistory({
      demandaId: id,
      user,
      acao: "Observações atualizadas",
      antes: before,
      depois: serializeDemand(current.toObject())
    });
    return NextResponse.json({ demanda: serializeDemand(current.toObject()) });
  }

  const payload = normalizeAdminDemandInput(body, before);
  const errors = validateDemandPayload(payload);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  Object.assign(current, {
    ...payload,
    prazo: new Date(payload.prazo),
    ...statusDates(payload.status)
  });

  await current.save();
  const after = serializeDemand(current.toObject());
  await logDemandHistory({
    demandaId: id,
    user,
    acao: "Demanda atualizada",
    antes: before,
    depois: after
  });

  return NextResponse.json({ demanda: after });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Apenas administradores podem excluir demandas." }, { status: 403 });
  }

  const { id } = await context.params;
  await connectMongo();
  const current = await DemandModel.findById(id);
  if (!current) {
    return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
  }

  const before = serializeDemand(current.toObject());
  await current.deleteOne();
  await logDemandHistory({
    demandaId: id,
    user,
    acao: "Demanda excluída",
    antes: before
  });

  return NextResponse.json({ ok: true });
}
