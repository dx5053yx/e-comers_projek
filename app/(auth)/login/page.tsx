import { Eye, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { guestLoginAction, isGuestLoginConfigured, loginAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { isDemoMode } from "@/lib/data/queries";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const demo = isDemoMode();
  const guestLoginAvailable = demo || (await isGuestLoginConfigured());

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle showLabel={false} />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle className="pt-2">Masuk ke siPandu</CardTitle>
          <CardDescription>
            Masuk untuk mengelola produk, order, payment, dan laporan UMKM.
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
              Mode demo aktif karena Supabase belum dikonfigurasi. Tombol login akan membuka dashboard demo.
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Contoh: owner@sipandu.id" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Masukkan password akun" required />
            </div>
            <Button className="w-full" type="submit">
              Masuk sebagai pengelola
            </Button>
          </form>
          {guestLoginAvailable ? (
            <>
              <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                atau
                <span className="h-px flex-1 bg-border" />
              </div>
              <form action={guestLoginAction}>
                <Button className="w-full" type="submit" variant="outline">
                  <Eye className="h-4 w-4" aria-hidden />
                  Lihat dashboard sebagai tamu
                </Button>
              </form>
            </>
          ) : null}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link className="font-medium text-primary" href="/register">
              Daftar UMKM
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
