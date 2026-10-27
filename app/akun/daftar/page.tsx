import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export default function RegisterPage() {
  return <AuthPageFrame showBack={false}><AuthForm mode="register" /></AuthPageFrame>;
}
