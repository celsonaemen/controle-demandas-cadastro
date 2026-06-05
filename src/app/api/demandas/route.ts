import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { normalizeDemandInput, statusDates, validateDemandPayload } from "@/lib/demand-input";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { serializeDemand } from "@/lib/serializers";
import { DemandModel } from "@/models/Demand";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await connectMongo();
  const records = await DemandModel.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ demandas: records.map((record) => serializeDemand(record)) });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = normalizeDemandInput(body, isAdmin(user));
  const errors = validateDemandPayload(payload);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  await connectMongo();
  const numero = await DemandModel.estimatedDocumentCount() + 1;
  const dates = statusDates(payload.status);

  const demanda = await DemandModel.create({
    ...payload,
    numero,
    prazo: new Date(payload.prazo),
    criadoPor: user.id,
    criadoPorNome: user.nome,
    ...dates
  });

  await logDemandHistory({
    demandaId: String(demanda._id),
    user,
    acao: "Demanda criada",
    depois: serializeDemand(demanda.toObject())
  });

  return NextResponse.json({ demanda: serializeDemand(demanda.toObject()) }, { status: 201 });
}
