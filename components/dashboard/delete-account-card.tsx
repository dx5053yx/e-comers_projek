"use client";

import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAccountAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

function DeleteButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={!enabled || pending} type="submit" variant="danger">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden />
      )}
      {pending ? "Menghapus akun" : "Hapus akun saya"}
    </Button>
  );
}

export function DeleteAccountCard({
  userEmail,
  readOnly,
  errorMessage,
}: {
  userEmail?: string | null;
  readOnly?: boolean;
  errorMessage?: string;
}) {
  const [confirmation, setConfirmation] = useState("");
  const normalizedEmail = userEmail?.trim().toLowerCase() ?? "";
  const canDelete = Boolean(normalizedEmail) && confirmation.trim().toLowerCase() === normalizedEmail;

  return (
    <Card className="border-danger/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <CardTitle>Hapus akun</CardTitle>
            <CardDescription>
              Akun login akan dihapus permanen. Toko milik akun ini disembunyikan dari publik,
              sementara data order dan riwayat transaksi tetap tersimpan.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}
        {readOnly ? (
          <div className="rounded-md border border-amber-300/70 bg-amber-100/70 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            Akun tamu hanya bisa melihat dashboard dan tidak dapat menghapus akun.
          </div>
        ) : (
          <form action={deleteAccountAction} className="grid gap-4 md:max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="confirm_email">Ketik email akun untuk konfirmasi</Label>
              <Input
                id="confirm_email"
                name="confirm_email"
                type="email"
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={userEmail ? `Contoh: ${userEmail}` : "Contoh: owner@sipandu.id"}
                required
              />
              <p className="text-xs text-muted-foreground">
                Email akun saat ini: <span className="font-medium text-foreground">{userEmail ?? "-"}</span>
              </p>
            </div>
            <div>
              <DeleteButton enabled={canDelete} />
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
