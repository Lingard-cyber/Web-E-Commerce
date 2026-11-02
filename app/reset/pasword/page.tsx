import { PasswordResetForm } from "@/components/password-reset-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

// Compatibility alias for links where "password" was typed as "pasword".
export default function ResetPasswordTypoPage() {
  return <AuthPageFrame showBack={false}><PasswordResetForm /></AuthPageFrame>;
}
