import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/session";

const SESSION_MAX_AGE = 60 * 60 * 8;

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await createSessionToken(user);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function isAdmin(user: SessionUser | null): user is SessionUser {
  return user?.role === "admin";
}
