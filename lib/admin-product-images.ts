import { NextResponse } from "next/server";
import { validationError } from "@/lib/admin-api";

export type UploadedProductImage = { key: string; imageUrl: string; isHero: boolean };
export const MAX_PRODUCT_IMAGES = 12;
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 24 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function readProductBody(request: Request): Promise<Record<string, unknown> | NextResponse> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const parsed: unknown = await request.json().catch(() => null);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  }

  const form = await request.formData();
  const body: Record<string, unknown> = {};
  form.forEach((value, key) => { if (typeof value === "string") body[key] = value; });
  const heroKeys = new Set(stringList(body.heroNewImageKeys));
  const keys = stringList(body.newImageKeys);
  const multipleFiles = form.getAll("files").filter((value): value is File => typeof value !== "string");
  const legacyFile = form.get("file");
  const files = multipleFiles.length ? multipleFiles : legacyFile && typeof legacyFile !== "string" ? [legacyFile] : [];

  if (files.length > MAX_PRODUCT_IMAGES) return validationError(`Maksimal ${MAX_PRODUCT_IMAGES} foto dapat diunggah sekaligus.`);
  let totalBytes = 0;
  const imageFiles: UploadedProductImage[] = [];
  for (const [index, file] of files.entries()) {
    if (!allowedImageTypes.has(file.type)) return validationError("Format foto harus JPG, PNG, WEBP, atau GIF.");
    if (file.size <= 0) return validationError("File foto yang dipilih kosong.");
    if (file.size > MAX_UPLOAD_BYTES) return validationError("Ukuran setiap foto maksimal 6 MB.");
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) return validationError("Total ukuran semua foto maksimal 24 MB per penyimpanan.");
    const key = keys[index] || `new-${index}`;
    imageFiles.push({ key, imageUrl: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`, isHero: heroKeys.has(key) });
  }
  if (multipleFiles.length) body.imageFiles = imageFiles;
  // Keep compatibility with the previous single-photo form.
  if (!multipleFiles.length && legacyFile && typeof legacyFile !== "string" && imageFiles.length) body.imageUrl = imageFiles[0].imageUrl;
  return body;
}

export function readStringList(value: unknown) {
  return stringList(value);
}
