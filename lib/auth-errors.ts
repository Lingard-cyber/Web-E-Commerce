export function getAuthErrorMessage(message: string, code?: string) {
  const normalized = `${code || ""} ${message}`.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Email atau kata sandi tidak sesuai.";
  if (normalized.includes("email not confirmed")) return "Email belum dikonfirmasi. Silakan cek inbox atau folder spam Anda.";
  if (normalized.includes("user already registered")) return "Email tersebut sudah terdaftar. Silakan masuk.";
  if (normalized.includes("password should be at least")) return "Kata sandi minimal 8 karakter.";
  if (normalized.includes("over_email_send_rate_limit") || normalized.includes("email rate limit exceeded")) return "Batas pengiriman email reset tercapai. Tunggu beberapa saat sebelum mencoba lagi.";
  if (normalized.includes("rate limit")) return "Terlalu banyak percobaan. Silakan tunggu beberapa saat lalu coba lagi.";
  if (normalized.includes("email_address_not_authorized") || normalized.includes("email address not authorized")) return "SMTP bawaan Supabase hanya boleh mengirim ke alamat tertentu. Aktifkan SMTP kustom di pengaturan Authentication Supabase.";
  if (normalized.includes("redirect_to_not_allowed") || (normalized.includes("redirect") && (normalized.includes("not allowed") || normalized.includes("allow list")))) return "URL callback reset belum diizinkan. Tambahkan https://umkmkepuharjo.my.id/auth/callback ke Redirect URLs di pengaturan Authentication Supabase.";
  if (normalized.includes("535") || normalized.includes("5.7.8") || normalized.includes("username and password not accepted") || normalized.includes("authentication failed")) return "Gmail menolak login SMTP. Periksa alamat username dan buat App Password Google baru (bukan kata sandi Gmail biasa), lalu simpan ulang di Supabase.";
  if (normalized.includes("550") || normalized.includes("5.7.1") || normalized.includes("sender address rejected") || normalized.includes("not owned by user")) return "Gmail menolak alamat pengirim. Samakan Sender email dengan akun Gmail pada Username SMTP.";
  if (normalized.includes("timeout") || normalized.includes("connection refused") || normalized.includes("could not connect") || normalized.includes("dial tcp")) return "Supabase tidak dapat terhubung ke SMTP. Untuk smtp.gmail.com gunakan port 587 atau 465 dan periksa kembali host serta port.";
  if (normalized.includes("error sending recovery email") || normalized.includes("failed to send recovery email") || normalized.includes("failed to send email") || normalized.includes("error sending email") || normalized.includes("smtp") || normalized.includes("gomail")) return "Supabase Auth gagal menyerahkan email ke SMTP. Buka Logs > Auth di dashboard Supabase untuk melihat penyebab spesifik, lalu cek pengaturan SMTP.";
  if (normalized.includes("invalid api key") || normalized.includes("no api key found")) return "Kunci publik Supabase di server tidak valid. Periksa NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  if (normalized.includes("invalid email")) return "Format email belum valid.";
  if (normalized.includes("auth session missing") || normalized.includes("session is missing") || normalized.includes("session not found")) return "Sesi reset sudah tidak aktif. Silakan minta tautan reset baru.";
  if (normalized.includes("same password") || normalized.includes("different password")) return "Gunakan kata sandi yang berbeda dari kata sandi sebelumnya.";
  if (normalized.includes("phone provider") || normalized.includes("sms provider")) return "Verifikasi nomor belum diaktifkan pada layanan autentikasi. Gunakan email atau aktifkan provider SMS di Supabase.";
  if (normalized.includes("invalid or expired otp") || normalized.includes("otp")) return "Kode OTP salah atau sudah kedaluwarsa. Silakan minta kode baru.";

  return "Autentikasi gagal. Silakan periksa data Anda lalu coba lagi.";
}
