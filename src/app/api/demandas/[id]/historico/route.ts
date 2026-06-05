import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeHistory } from "@/lib/serializers";
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
  return NextResponse.json({ historico: records.map((record) => serializeHistory(record)) });
}
