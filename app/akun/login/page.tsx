import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export default function LoginPage() {
  return <AuthPageFrame><AuthForm mode="login" /></AuthPageFrame>;
}
