import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeUser } from "@/lib/serializers";
import { UserModel } from "@/models/User";

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
  const role = totalUsers === 0 ? "admin" : "solicitante";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    nome,
    email,
    passwordHash,
    role,
    ativo: true
  });

  const serialized = serializeUser(user.toObject());
  await setSession({
    id: serialized.id,
    nome: serialized.nome,
    email: serialized.email,
    role: serialized.role
  });

  return NextResponse.json({ user: serialized });
}
