import { createClient } from "@supabase/supabase-js";

const adminEmails = new Set([
  "raphaela.grama@gmail.com",
  "pedro.phfg11@gmail.com",
]);

export async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  return email && adminEmails.has(email) ? data.user : null;
}