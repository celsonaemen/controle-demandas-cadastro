import { NextResponse } from "next/server";
import { deleteDemandAttachment, getDemandAttachmentFile } from "@/lib/attachments";
import { getSession, isAdmin } from "@/lib/auth";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { DemandModel } from "@/models/Demand";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string; fileId: string }>;
};

function contentDisposition(filename: string) {
  const safeName = filename.replace(/"/g, "'");
  return `attachment; filename="${safeName}"`;
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id, fileId } = await context.params;
  await connectMongo();
  const demanda = await DemandModel.findById(id).lean();
  if (!demanda) {
    return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
  }

  const attachment = await getDemandAttachmentFile(id, fileId);
  if (!attachment) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  return new Response(attachment.stream, {
    headers: {
      "Content-Type": attachment.file.tipo || "application/octet-stream",
      "Content-Disposition": contentDisposition(attachment.file.nome),
      "Cache-Control": "private, max-age=0"
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Apenas administradores podem excluir arquivos." }, { status: 403 });
  }

  const { id, fileId } = await context.params;
  const deleted = await deleteDemandAttachment(id, fileId);
  if (!deleted) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  await logDemandHistory({
    demandaId: id,
    user,
    acao: "Arquivo excluído manualmente",
    antes: { fileId }
  });

  return NextResponse.json({ ok: true });
}
