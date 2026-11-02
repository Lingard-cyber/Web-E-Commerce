import { PasswordResetForm } from "@/components/password-reset-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export default function ResetPasswordPage() {
  return <AuthPageFrame showBack={false}><PasswordResetForm /></AuthPageFrame>;
}
