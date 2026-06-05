import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeUser } from "@/lib/serializers";
import { UserModel } from "@/models/User";

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const firstForwarded = forwarded.split(",")[0]?.trim();
  return firstForwarded || request.headers.get("x-real-ip") || "nao informado";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const nome = String(body.nome || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!nome || !email || !password) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "A senha precisa ter no mínimo 8 caracteres." }, { status: 400 });
  }

  await connectMongo();

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
  }

  const totalUsers = await UserModel.estimatedDocumentCount();
  const isFirstUser = totalUsers === 0;
  const role = isFirstUser ? "admin" : "solicitante";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    nome,
    email,
    passwordHash,
    role,
    ativo: isFirstUser,
    statusAcesso: isFirstUser ? "aprovado" : "pendente",
    cadastroIp: getClientIp(request),
    cadastroUserAgent: request.headers.get("user-agent") || "",
    aprovadoEm: isFirstUser ? new Date() : null,
    aprovadoPorNome: isFirstUser ? "Primeiro acesso" : ""
  });

  const serialized = serializeUser(user.toObject());
  if (!isFirstUser) {
    return NextResponse.json({
      user: serialized,
      pending: true,
      message: "Sua solicitacao de acesso foi enviada ao administrador. Aguarde a aprovacao e depois faca login."
    }, { status: 201 });
  }

  await setSession({
    id: serialized.id,
    nome: serialized.nome,
    email: serialized.email,
    role: serialized.role
  });

  return NextResponse.json({ user: serialized });
}
