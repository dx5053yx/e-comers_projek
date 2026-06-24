import Link from "next/link";
import { registerAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { isDemoMode } from "@/lib/data/queries";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const demo = isDemoMode();

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
            kak, warungnya buka jam berapa?
            <div className="bubble__time">08:00 ✓✓</div>
          </div>
          <div className="bubble bubble--outgoing">
            <div className="bubble__sender">siPandu Bot</div>
            Warung buka dari jam 09:00 sampai 21:00 kak. Mau pesan apa hari ini?
            <div className="bubble__time">08:00 ✓</div>
          </div>
        </div>
        
        <div className="mt-12 text-center max-w-sm relative z-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Auto-Reply 24/7</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">Bot menjawab kapan saja — tengah malam pun. Tanpa kamu harus standby terus menerus.</p>
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
               Yuk mulai pendaftaran UMKM 👋
             </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Daftar UMKM</h1>
          <p className="mt-2 text-[var(--muted-foreground)] text-sm mb-8">Buat akun pemilik dan profil bisnis awal untuk dashboard siPandu.</p>
          
          {params.error && (
            <div className="mb-6 rounded-md border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
              {params.error}
            </div>
          )}
          {demo && (
            <div className="mb-6 rounded-md border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-3 py-2 text-sm text-[var(--warning)]">
              Mode demo aktif. Form ini akan langsung membuka dashboard demo sampai Supabase dikonfigurasi.
            </div>
          )}
          
          <form action={registerAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama pemilik</Label>
              <Input id="full_name" name="full_name" placeholder="Contoh: Aqil Fachri" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama bisnis</Label>
              <Input id="business_name" name="business_name" placeholder="Contoh: Warung Seblak Ibu Ani" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
              <Input id="whatsapp_number" name="whatsapp_number" placeholder="Contoh: 6281234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="owner@sipandu.id" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} placeholder="Minimal 8 karakter" required />
            </div>
            <Button className="w-full" type="submit">
              Buat akun
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Sudah punya akun?{" "}
            <Link className="font-bold text-primary hover:underline" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
