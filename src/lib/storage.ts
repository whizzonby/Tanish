import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// TODO(Phase 6): swap this local-disk implementation for S3 presigned uploads
// (see the approved plan's "File storage" decision) when deploying to AWS.
// The call sites only depend on this function's signature, so the swap is
// contained to this file.
export async function saveUploadedFile(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
