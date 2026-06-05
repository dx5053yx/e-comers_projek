import Link from "next/link";
import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Daftar UMKM</CardTitle>
          <CardDescription>
            Buat akun pemilik dan profil bisnis awal untuk dashboard siPandu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {params.error}
            </div>
          ) : null}
          {demo ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Mode demo aktif. Form ini akan langsung membuka dashboard demo sampai Supabase dikonfigurasi.
            </div>
          ) : null}
          <form action={registerAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nama pemilik</Label>
              <Input id="full_name" name="full_name" placeholder="Contoh: Aqil Fachri" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="business_name">Nama bisnis</Label>
              <Input id="business_name" name="business_name" placeholder="Contoh: Warung Seblak Ibu Ani" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
              <Input id="whatsapp_number" name="whatsapp_number" placeholder="Contoh: +6281234567890" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Contoh: owner@sipandu.id" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} placeholder="Minimal 8 karakter" required />
            </div>
            <Button className="w-full" type="submit">
              Buat akun
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link className="font-medium text-primary" href="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
