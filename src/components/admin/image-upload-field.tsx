"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadMedia } from "@/app/admin/actions/upload";

export function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      try {
        const result = await uploadMedia(formData);
        setUrl(result.url);
      } catch {
        setError("Upload failed — please try again.");
      }
    });
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-900">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        {url ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-800/10 bg-cream-100">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-navy-800/20 text-xs text-navy-800/40">
            No image
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={isPending}
            className="block text-xs text-navy-800/70 file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream-50"
          />
          {isPending && <p className="mt-1 text-xs text-navy-800/50">Uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
