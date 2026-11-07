import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const profile = await tx.umkm.findUnique({
        where: { id: params.id },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      });
      if (!profile) return null;

      await tx.auditLog.create({
        data: {
          action: "delete",
          entity: "umkm",
          entityId: profile.id,
          metadata: {
            actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom",
            name: profile.name,
            slug: profile.slug,
            productsDetached: profile._count.products,
          },
        },
      });
      await tx.umkm.delete({ where: { id: profile.id } });
      return { slug: profile.slug, productsDetached: profile._count.products };
    });

    if (!deleted) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
    revalidatePath("/");
    revalidatePath("/umkm");
    revalidatePath("/kategori");
    revalidatePath(`/umkm/${deleted.slug}`);
    revalidateTag("public-umkm");
    revalidateTag("public-catalog");
    return NextResponse.json({ ok: true, productsDetached: deleted.productsDetached });
  } catch (error) {
    console.error("Admin UMKM permanent delete failed:", error);
    return NextResponse.json({ error: "Profil belum dapat dihapus. Periksa koneksi database lalu coba lagi." }, { status: 503 });
  }
}
