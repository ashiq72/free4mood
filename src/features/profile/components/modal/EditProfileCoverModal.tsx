"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { updateUser } from "@/lib/api/user";

interface EditProfileCoverModalProps {
  openCoverModal: boolean;
  onClose: () => void;
  loadUser: () => void;
  currentCover?: string;
}

export default function EditProfileCoverModal({
  openCoverModal,
  onClose,
  loadUser,
  currentCover,
}: EditProfileCoverModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!openCoverModal) return;
    setFile(null);
    setError(null);
    setPreview(currentCover || "");
  }, [openCoverModal, currentCover]);

  useEffect(() => {
    if (!openCoverModal) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [openCoverModal, loading, onClose]);

  useEffect(() => {
    document.body.style.overflow = openCoverModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCoverModal]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!openCoverModal) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };

  const handleSave = async () => {
    if (!file) {
      setError("Please choose a cover image");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("updateTarget", "cover");

      await updateUser(formData);
      await loadUser();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update cover";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Update Cover Photo
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            x
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="w-full aspect-[16/6] rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            {preview ? (
              <Image
                src={preview}
                alt="Cover preview"
                width={1280}
                height={480}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                No cover image selected
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-zinc-800">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Cover"}
          </Button>
        </div>
      </div>
    </div>
  );
}

