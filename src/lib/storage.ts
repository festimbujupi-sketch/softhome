import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";

/**
 * Resizes an uploaded photo to web size and stores it.
 * With BLOB_READ_WRITE_TOKEN set (Vercel), files go to Vercel Blob.
 * Locally they are written to public/uploads.
 */
export async function storeImage(file: File, baseName: string) {
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const name = `${baseName || "foto"}-${crypto.randomBytes(4).toString("hex")}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${name}`, output, { access: "public", contentType: "image/webp" });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), output);
  return `/uploads/${name}`;
}
