import { Eye, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { guestLoginAction, isGuestLoginConfigured, loginAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { isDemoMode } from "@/lib/data/queries";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const demo = isDemoMode();
  const guestLoginAvailable = demo || (await isGuestLoginConfigured());

  return (
    <main className="min-h-screen flex bg-[var(--background)]">
      {/* Kolom Kiri: Preview Chat */}
      <div className="hidden lg:flex w-1/2 bg-[var(--chat-bg)] flex-col justify-center items-center p-12 relative overflow-hidden border-r border-[var(--border)]">
        <div className="absolute top-8 left-8">
          <Link href="/" className="font-bold text-xl text-primary">siPandu</Link>
        </div>
        
        <div className="chat-window w-full max-w-md shadow-lg border border-[var(--border-subtle)] relative z-10">
          <div className="chat-day-separator">Hari ini</div>
          <div className="bubble bubble--incoming">
            pesan ayam geprek 2, es teh manis 2
            <div className="bubble__time">09:41 ✓✓</div>
          </div>
          <div className="bubble bubble--outgoing">
            <div className="bubble__sender">siPandu Bot</div>
            Baik Kak! Pesanan sudah dicatat dan masuk ke dashboard. Mohon tunggu sebentar ya.
            <div className="bubble__time">09:41 ✓</div>
          </div>
        </div>
        
        <div className="mt-12 text-center max-w-sm relative z-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Pesanan masuk otomatis</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">AI membantu membalas chat pelanggan dan mencatat pesanan langsung ke dashboard UMKM-mu.</p>
        </div>
      </div>
      
      {/* Kolom Kanan: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-[var(--landing-surface)]">
        <div className="absolute right-6 top-6">
          <ThemeToggle showLabel={false} />
        </div>
        
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex justify-center">
             <div className="bubble bubble--outgoing inline-block shadow-sm border border-[var(--border)] text-sm px-4 py-2 bg-[var(--chat-outgoing)] rounded-[var(--radius-chat-right)]">
               <div className="bubble__sender">siPandu</div>
               Silakan masuk ke Dashboard 👋
             </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard UMKM</h1>
          <p className="mt-2 text-[var(--muted-foreground)] text-sm mb-8">Masuk untuk mengelola produk, pesanan, dan laporan.</p>
          
          {params.error && (
            <div className="mb-6 rounded-md border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
              {params.error}
            </div>
          )}
          {params.success && (
            <div className="mb-6 rounded-md border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-3 py-2 text-sm text-[var(--success)]">
              {params.success}
            </div>
          )}
          {demo && (
            <div className="mb-6 rounded-md border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-3 py-2 text-sm text-[var(--warning)]">
              Mode demo aktif karena Supabase belum dikonfigurasi. Tombol login akan membuka dashboard demo.
            </div>
          )}
          
          <form action={loginAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="owner@sipandu.id" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button className="w-full" type="submit">
              Masuk sebagai pengelola
            </Button>
          </form>
          
          {guestLoginAvailable && (
            <>
              <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                <span className="h-px flex-1 bg-[var(--border)]" />
                atau
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <form action={guestLoginAction}>
                <Button className="w-full" type="submit" variant="outline">
                  <Eye className="mr-2 h-4 w-4" aria-hidden />
                  Lihat dashboard sebagai tamu
                </Button>
              </form>
            </>
          )}
          
          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Belum punya akun?{" "}
            <Link className="font-bold text-primary hover:underline" href="/register">
              Daftar UMKM
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
