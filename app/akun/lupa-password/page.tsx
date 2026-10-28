import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export default function ForgotPasswordPage() {
  return <AuthPageFrame modal><PasswordResetRequestForm /></AuthPageFrame>;
}
