"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";

export function LogoutDialog({
  open,
  loading = false,
  title = "Keluar dari akun?",
  description = "Anda akan keluar dari sesi saat ini. Anda dapat masuk kembali kapan saja.",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return <ConfirmDialog open={open} loading={loading} title={title} description={description} confirmLabel="Keluar" onCancel={onCancel} onConfirm={onConfirm} />;
}
