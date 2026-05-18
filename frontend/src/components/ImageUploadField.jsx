import { useRef, useState } from "react";
import { Image as ImageIcon, Link, Loader2, Upload, X } from "lucide-react";

import uploadAPI from "../api/uploadAPI";

const ImageUploadField = ({
  label = "Image",
  value = "",
  onChange,
  uploadType = "food",
  disabled = false,
  helperText = "Upload an image or paste an image URL.",
  aspectClass = "aspect-[16/10]",
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const response = await uploadAPI.image({ file, type: uploadType });
      const uploadedUrl = response?.data?.image?.url;

      if (!uploadedUrl) {
        throw new Error("Upload completed without an image URL.");
      }

      onChange(uploadedUrl);
    } catch (uploadError) {
      setError(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
          {label}
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={13} />
            Clear
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
        <div
          className={`${aspectClass} overflow-hidden rounded-2xl border border-slate-200 bg-slate-50`}
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
              <ImageIcon size={30} />
              <span className="text-xs font-bold uppercase tracking-widest">
                No image
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="btn-secondary flex-1 px-4 py-3 text-sm"
            >
              {uploading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Upload size={17} />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-4 py-3 text-sm"
              >
                <Link size={17} />
                Open
              </a>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled || uploading}
            className="input-surface py-3 text-sm"
          />

          <p className="text-xs font-medium text-slate-400">{helperText}</p>
          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
