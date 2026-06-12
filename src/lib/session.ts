import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@/types/domain";

export const SESSION_COOKIE = "cadastro_demandas_session";

export type SessionUser = {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  lastAccessAt?: string | null;
};

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Defina NEXTAUTH_SECRET no arquivo .env.local.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    nome: user.nome,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());
}

export async function verifySessionToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email || !payload.nome || !payload.role) {
      return null;
    }

    return {
      id: payload.sub,
      email: String(payload.email),
      nome: String(payload.nome),
      role: payload.role as UserRole,
      lastAccessAt: null
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
