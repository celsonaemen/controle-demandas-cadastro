import { NextResponse } from "next/server";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  formatMaxAttachmentSize,
  isAcceptedAttachment,
  listDemandAttachments,
  MAX_ATTACHMENT_SIZE,
  saveDemandAttachment
} from "@/lib/attachments";
import { getSession } from "@/lib/auth";
import { logDemandHistory } from "@/lib/history";
import { connectMongo } from "@/lib/mongodb";
import { DemandModel } from "@/models/Demand";

export const runtime = "nodejs";

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

  const arquivos = await listDemandAttachments(id);
  return NextResponse.json({ arquivos });
}

export async function POST(request: Request, context: RouteContext) {
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

  if (demanda.status === "Concluída" || demanda.status === "Cancelada") {
    return NextResponse.json({ error: "Não é possível anexar arquivos em demanda concluída ou cancelada." }, { status: 400 });
  }

  const formData = await request.formData();
  const entries = formData.getAll("files");
  const files = entries.filter((entry): entry is File => {
    return typeof entry === "object" && entry !== null && "arrayBuffer" in entry && "name" in entry;
  });

  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const uploaded = [];
  for (const file of files) {
    if (!isAcceptedAttachment(file)) {
      return NextResponse.json({
        error: `Tipo de arquivo não permitido. Envie PDF, JPG, PNG, DOCX ou XLSX. Tipo recebido: ${file.type || "desconhecido"}.`,
        allowed: ACCEPTED_ATTACHMENT_TYPES
      }, { status: 400 });
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ error: `Arquivo "${file.name}" excede o limite de ${formatMaxAttachmentSize()}.` }, { status: 400 });
    }

    const saved = await saveDemandAttachment({
      demandId: id,
      file,
      uploadedBy: user.id,
      uploadedByName: user.nome
    });

    if (saved) {
      uploaded.push(saved);
    }
  }

  await logDemandHistory({
    demandaId: id,
    user,
    acao: `${uploaded.length} arquivo(s) anexado(s)`,
    depois: { arquivos: uploaded.map((file) => file.nome) }
  });

  return NextResponse.json({ arquivos: uploaded }, { status: 201 });
}
