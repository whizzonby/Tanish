"use client";

import { useState, useTransition } from "react";
import { uploadMedia } from "@/app/admin/actions/upload";

export function FileUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
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
        onChange(result.url);
      } catch {
        setError("Upload failed — please try again.");
      }
    });
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-navy-900">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Uploaded file URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-navy-800/15 px-3 py-2 text-xs text-navy-900"
        />
        <label className="shrink-0 cursor-pointer rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-cream-50">
          {isPending ? "Uploading…" : "Upload"}
          <input type="file" onChange={onFileChange} disabled={isPending} className="hidden" />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block truncate text-xs text-gold-600 hover:underline"
        >
          {value}
        </a>
      )}
    </div>
  );
}
