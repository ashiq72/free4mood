"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { updateUser } from "@/lib/api/user";

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

  if (!openImageModal) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

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
      formData.append("file", file); // ✅ FIXED

      await updateUser(formData);
      await loadUser();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile image";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Update Profile Photo</h2>

        {preview && (
          <Image
            src={preview}
            width={200}
            height={200}
            alt="Preview"
            className="rounded-full mx-auto mb-4"
          />
        )}

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
