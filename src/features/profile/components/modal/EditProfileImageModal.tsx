"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { updateUser } from "@/lib/api/user";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

interface Props {
  openImageModal: boolean;
  onClose: () => void;
  loadUser: () => void;
}

export default function EditProfileImageModal({
  openImageModal,
  onClose,
  loadUser,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!openImageModal) return;
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [openImageModal]);

  useEffect(() => {
    if (!openImageModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onClose, openImageModal]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!openImageModal) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!ALLOWED_TYPES.has(selected.type)) {
      setError("Choose a JPEG or PNG image");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("Image must be 5 MB or smaller");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };

  const handleSave = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      await updateUser(formData);
      await loadUser();
      onClose();
    } catch (uploadError: unknown) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to update profile image",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-image-title"
    >
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="profile-image-title" className="text-lg font-semibold">
            Update profile photo
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <XIcon />
          </Button>
        </div>

        {preview ? (
          <Image
            src={preview}
            width={200}
            height={200}
            alt="Selected profile preview"
            className="mx-auto mb-4 aspect-square rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="mx-auto mb-4 flex size-48 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500 dark:bg-zinc-800">
            No image selected
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="block w-full text-sm"
        />

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !file}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
