require("dotenv").config({ override: true });

const { PrismaClient } = require("../generated/prisma");
const { createClient } = require("@supabase/supabase-js");

const demoEmail = "demo@kepuharjomarket.test";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true, authId: true, _count: { select: { orders: true } } },
  });

  if (!user) {
    console.log("Akun dummy sudah tidak ada.");
    return;
  }

  if (user._count.orders > 0) {
    throw new Error("Akun dummy masih memiliki pesanan; pembersihan dihentikan agar riwayat pesanan tetap aman.");
  }

  if (user.authId) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Kredensial Supabase admin diperlukan untuk menghapus akun autentikasi dummy.");

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await supabase.auth.admin.deleteUser(user.authId);
    if (error) throw new Error(`Akun autentikasi dummy gagal dihapus: ${error.message}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  console.log("Akun dummy demo@kepuharjomarket.test berhasil dihapus.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Pembersihan akun dummy gagal.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
