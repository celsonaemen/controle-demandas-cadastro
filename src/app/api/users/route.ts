import { NextResponse } from "next/server";
import { isAdmin, getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { serializeUser } from "@/lib/serializers";
import { UserModel } from "@/models/User";

export async function GET() {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Apenas administradores podem listar usuários." }, { status: 403 });
  }

  await connectMongo();
  const users = await UserModel.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json({ users: users.map((record) => serializeUser(record)) });
}
