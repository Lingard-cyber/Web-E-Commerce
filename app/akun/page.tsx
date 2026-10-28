import { AccountPanel } from "@/components/account-panel";
import { AuthPageFrame } from "@/components/auth-page-frame";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({ searchParams }: { searchParams: { mode?: string } }) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect(searchParams.mode === "register" ? "/akun/daftar" : "/akun/login?next=/akun");
  const initialMode = searchParams.mode === "register" ? "register" : "login";

  return (
    <AuthPageFrame>
      <div className="w-full max-w-[900px]">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-forest-700">Profil pelanggan</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink">Kelola profil dan keamanan akun.</h1>
        </div>
        <AccountPanel initialMode={initialMode} />
      </div>
    </AuthPageFrame>
  );
}
