"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <UserIcon className="w-5 h-5 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 hover:text-zinc-600 transition-colors text-sm font-medium"
      >
        <UserIcon className="w-5 h-5" />
        <span className="hidden md:inline">Login / Cadastre-se</span>
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Minha Conta";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
        <UserIcon className="w-4 h-4 text-rose-500" />
        <span className="max-w-[120px] md:max-w-[160px] truncate">
          {displayName}
        </span>
      </div>
      <button
        onClick={handleLogout}
        title="Sair da conta"
        className="text-zinc-400 hover:text-red-600 transition-colors p-1"
        aria-label="Sair"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
