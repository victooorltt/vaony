import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StorageProvider {
  /** Saves a file and returns its public URL. */
  save(buffer: Buffer, originalName: string, folder: string): Promise<string>;
}

/** Local disk driver (dev). Swap for an S3/Cloudinary driver in production
 *  by implementing StorageProvider and switching on STORAGE_DRIVER. */
class LocalStorage implements StorageProvider {
  async save(buffer: Buffer, originalName: string, folder: string): Promise<string> {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const fileName = `${crypto.randomBytes(8).toString("hex")}-${safeName}`;
    const dir = path.join(process.cwd(), "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);
    return `/api/files/${folder}/${fileName}`;
  }
}

export function getStorage(): StorageProvider {
  return new LocalStorage();
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB (spec §4.7)

export const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  chat: [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx"],
  materials: [".pdf", ".docx", ".xlsx", ".jpg", ".jpeg", ".png", ".mp4", ".zip"],
  avatars: [".png", ".jpg", ".jpeg", ".webp"],
  credentials: [".pdf", ".jpg", ".jpeg", ".png"],
  cv: [".pdf"],
};

export function isAllowed(fileName: string, folder: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return (ALLOWED_UPLOAD_TYPES[folder] ?? []).includes(ext);
}
