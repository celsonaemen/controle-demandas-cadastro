import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { serializeHistory } from "@/lib/serializers";
import { DemandModel } from "@/models/Demand";
import { DemandHistoryModel } from "@/models/DemandHistory";

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
  const records = await DemandHistoryModel.find({ demandaId: id }).sort({ createdAt: -1 }).lean();
  const visibleRecords = isAdmin(user)
    ? records
    : records.filter((record) => !isInternalProgress(record));

  return NextResponse.json({ historico: visibleRecords.map((record) => serializeHistory(record)) });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Apenas administradores podem registrar andamento interno." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const comentario = String(body.comentario || "").trim();

  if (!comentario) {
    return NextResponse.json({ error: "Informe o andamento antes de salvar." }, { status: 400 });
  }

  if (comentario.length > 2000) {
    return NextResponse.json({ error: "O andamento deve ter no maximo 2000 caracteres." }, { status: 400 });
  }

  await connectMongo();
  const demanda = await DemandModel.findById(id);
  if (!demanda) {
    return NextResponse.json({ error: "Demanda nao encontrada." }, { status: 404 });
  }

  const record = await logDemandHistory({
    demandaId: id,
    user,
    acao: "Andamento interno registrado",
    depois: { comentario, interno: true }
  });

  await DemandModel.updateOne({ _id: id }, { $set: { updatedAt: new Date() } });

  return NextResponse.json({ historico: serializeHistory(record.toObject()) }, { status: 201 });
}

function isInternalProgress(record: { depois?: unknown }) {
  const depois = record.depois as { interno?: unknown } | null | undefined;
  return depois?.interno === true;
}
