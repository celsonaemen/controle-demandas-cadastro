import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeUser } from "@/lib/serializers";
import { UserModel } from "@/models/User";
import type { UserAccessStatus, UserRole } from "@/types/domain";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function text(value: unknown) {
  return String(value || "").trim();
}

export async function PATCH(request: Request, context: RouteContext) {
  const currentUser = await getSession();
  if (!isAdmin(currentUser)) {
    return NextResponse.json({ error: "Apenas administradores podem alterar usuarios." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const nome = text(body.nome);
  const email = text(body.email).toLowerCase();
  const role = text(body.role) as UserRole;
  const statusAcesso = text(body.statusAcesso) as UserAccessStatus;
  const password = String(body.password || "");

  if (!nome || !email) {
    return NextResponse.json({ error: "Nome e e-mail sao obrigatorios." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail invalido." }, { status: 400 });
  }

  if (role !== "admin" && role !== "solicitante") {
    return NextResponse.json({ error: "Perfil invalido." }, { status: 400 });
  }

  if (!["pendente", "aprovado", "rejeitado"].includes(statusAcesso)) {
    return NextResponse.json({ error: "Status de acesso invalido." }, { status: 400 });
  }

  if (password && password.length < 8) {
    return NextResponse.json({ error: "A nova senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const ativo = statusAcesso === "aprovado" ? Boolean(body.ativo ?? true) : false;
  if (id === currentUser.id && (role !== "admin" || !ativo || statusAcesso !== "aprovado")) {
    return NextResponse.json({ error: "Voce nao pode remover seu proprio acesso administrativo." }, { status: 400 });
  }

  await connectMongo();
  const emailOwner = await UserModel.findOne({ email, _id: { $ne: id } }).lean();
  if (emailOwner) {
    return NextResponse.json({ error: "Este e-mail ja esta em uso por outro usuario." }, { status: 409 });
  }

  const current = await UserModel.findById(id);
  if (!current) {
    return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  }

  const update: Record<string, unknown> = {
    nome,
    email,
    role,
    ativo,
    statusAcesso
  };

  if (statusAcesso === "aprovado" && current.statusAcesso !== "aprovado") {
    update.aprovadoEm = new Date();
    update.aprovadoPor = currentUser.id;
    update.aprovadoPorNome = currentUser.nome;
  }

  if (password) {
    update.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await UserModel.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(user.toObject()) });
}
