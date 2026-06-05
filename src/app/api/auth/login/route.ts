import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeUser } from "@/lib/serializers";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha sao obrigatorios." }, { status: 400 });
  }

  await connectMongo();

  const user = await UserModel.findOne({ email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 });
  }

  if (user.statusAcesso === "pendente") {
    return NextResponse.json({ error: "Seu acesso ainda aguarda aprovacao do administrador." }, { status: 403 });
  }

  if (user.statusAcesso === "rejeitado" || !user.ativo) {
    return NextResponse.json({ error: "Seu acesso nao esta ativo. Fale com o administrador." }, { status: 403 });
  }

  const serialized = serializeUser(user.toObject());
  await setSession({
    id: serialized.id,
    nome: serialized.nome,
    email: serialized.email,
    role: serialized.role
  });

  return NextResponse.json({ user: serialized });
}
