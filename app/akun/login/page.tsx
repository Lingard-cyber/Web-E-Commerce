import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export default function LoginPage() {
  return <AuthPageFrame modal><AuthForm mode="login" /></AuthPageFrame>;
}
