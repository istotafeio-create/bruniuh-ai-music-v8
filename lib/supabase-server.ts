import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createUserSupabase(accessToken: string) {
  return createClient(url, publishable, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function createAdminSupabase() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY em falta.");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function bearerToken(req: Request) {
  const value = req.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

export async function requireUser(req: Request) {
  const token = bearerToken(req);
  if (!token) return { error: "Não autenticado.", status: 401 as const };

  const supabase = createUserSupabase(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: "Sessão inválida ou expirada.", status: 401 as const };
  }

  return { user: data.user, token, supabase };
}
