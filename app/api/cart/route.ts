import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

type CartPayload = { items?: Array<{ variantId?: string; quantity?: number }> };

async function getDatabaseUser() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user?.email) return null;
  await syncAuthUser(user);
  return prisma.user.findUnique({ where: { authId: user.id }, select: { id: true } });
}

function serializeCart(cart: { items: Array<{ variantId: string; quantity: number; variant: { label: string; priceIdr: number | null; product: { slug: string; name: string; images: Array<{ imageUrl: string }> } } }> }) {
  return cart.items.filter((item) => item.variant.priceIdr !== null).map((item) => ({ variantId: item.variantId, productSlug: item.variant.product.slug, productName: item.variant.product.name, variantLabel: item.variant.label, unitPrice: item.variant.priceIdr as number, quantity: item.quantity, imageSrc: item.variant.product.images[0]?.imageUrl }));
}

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ items: [] });
  const user = await getDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const cart = await prisma.cart.findUnique({ where: { userId: user.id }, include: { items: { where: { variant: { isActive: true, product: { publishStatus: "published", productType: { not: "service" } } } }, include: { variant: { include: { product: { include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } } } } } }, orderBy: { createdAt: "asc" } } } });
  return NextResponse.json({ items: cart ? serializeCart(cart) : [] });
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const user = await getDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const body = await request.json().catch(() => null) as CartPayload | null;
  const rawItems = body?.items || [];
  const items = rawItems.map((item) => ({ variantId: String(item.variantId || ""), quantity: Number(item.quantity) })).filter((item) => item.variantId && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);
  if (items.length !== rawItems.length || new Set(items.map((item) => item.variantId)).size !== items.length) return NextResponse.json({ error: "Data keranjang tidak valid." }, { status: 400 });
  const variants = items.length ? await prisma.productVariant.findMany({ where: { id: { in: items.map((item) => item.variantId) }, isActive: true, product: { publishStatus: "published", productType: { not: "service" } } }, select: { id: true } }) : [];
  if (variants.length !== items.length) return NextResponse.json({ error: "Salah satu item sudah tidak tersedia." }, { status: 409 });

  const cart = await prisma.$transaction(async (tx) => {
    const current = await tx.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    if (items.length) await tx.cartItem.deleteMany({ where: { cartId: current.id, variantId: { notIn: items.map((item) => item.variantId) } } });
    else await tx.cartItem.deleteMany({ where: { cartId: current.id } });
    for (const item of items) await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: current.id, variantId: item.variantId } }, update: { quantity: item.quantity }, create: { cartId: current.id, variantId: item.variantId, quantity: item.quantity } });
    return tx.cart.findUniqueOrThrow({ where: { id: current.id }, include: { items: { include: { variant: { include: { product: { include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } } } } } }, orderBy: { createdAt: "asc" } } } });
  });
  return NextResponse.json({ items: serializeCart(cart) });
}
