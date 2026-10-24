export function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Email atau kata sandi tidak sesuai.";
  if (normalized.includes("email not confirmed")) return "Email belum dikonfirmasi. Silakan cek inbox atau folder spam Anda.";
  if (normalized.includes("user already registered")) return "Email tersebut sudah terdaftar. Silakan masuk.";
  if (normalized.includes("password should be at least")) return "Kata sandi minimal 8 karakter.";
  if (normalized.includes("rate limit")) return "Terlalu banyak percobaan. Silakan tunggu beberapa saat lalu coba lagi.";
  if (normalized.includes("invalid email")) return "Format email belum valid.";
  if (normalized.includes("email rate limit exceeded")) return "Email verifikasi terlalu sering diminta. Silakan tunggu beberapa saat.";

  return "Autentikasi gagal. Silakan periksa data Anda lalu coba lagi.";
}
