import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const body = await request.json().catch(() => null) as { productSlug?: string; name?: string; contact?: string; message?: string } | null;
  const productSlug = body?.productSlug?.trim();
  const name = body?.name?.trim();
  const contact = body?.contact?.trim();
  const message = body?.message?.trim();
  if (!productSlug || !name || !contact || !message) return NextResponse.json({ error: "Nama, kontak, dan kebutuhan wajib diisi." }, { status: 400 });
  if (name.length > 120 || contact.length > 160 || message.length > 3000) return NextResponse.json({ error: "Panjang data melebihi batas yang diizinkan." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true, productType: true } });
  if (!product || product.productType !== "service") return NextResponse.json({ error: "Layanan belum tersedia pada database operasional." }, { status: 404 });

  let userId: string | undefined;
  try {
    const { data: { user } } = await createClient().auth.getUser();
    if (user?.id) userId = (await prisma.user.findUnique({ where: { authId: user.id }, select: { id: true } }))?.id;
  } catch {
    // Inquiry remains available for guests; userId is optional by design.
  }

  await prisma.serviceInquiry.create({ data: { productId: product.id, userId, name, contact, message } });
  return NextResponse.json({ message: "Permintaan berhasil dikirim. Admin Forkom akan menghubungi Anda untuk koordinasi berikutnya." }, { status: 201 });
}
