"use client";

import { Button } from "@/shared/ui/button";
import { updateUser } from "@/lib/api/user";
import { useEffect, useState } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import type { IUserInfo } from "@/features/profile/types";

/* ---------------- Types ---------------- */


interface EditProfileFullModalProps {
  openFullModal: boolean;
  onClose: () => void;
  loadUser: () => void;
  userInfo: IUserInfo | null;
}

interface FormDataType extends Record<string, unknown> {
  bio: string;
  about: string;
  location: string;
  website: string;
  dateOfBirth: string;
}

/* ---------------- Helper ---------------- */
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------- Component ---------------- */
export default function EditProfileFullModal({
  openFullModal,
  onClose,
  loadUser,
  userInfo,
}: EditProfileFullModalProps) {
  const [formData, setFormData] = useState<FormDataType>({
    bio: "",
    about: "",
    location: "",
    website: "",
    dateOfBirth: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ✅ Prefill form when modal opens */
  useEffect(() => {
    if (openFullModal && userInfo) {
      setFormData({
        bio: userInfo.bio || "",
        about: userInfo.about || "",
        location: userInfo.location || "",
        website: userInfo.website || "",
        dateOfBirth: userInfo.dateOfBirth
          ? userInfo.dateOfBirth.slice(0, 10) // ✅ important
          : "",
      });
    }
  }, [openFullModal, userInfo]);

  /* Close on ESC */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = openFullModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openFullModal]);

  if (!openFullModal) return null;

  /* Handle input change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Submit */
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateUser(formData);

      await sleep(800); // small UX delay
      await loadUser(); // 🔥 refresh profile data
      onClose();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Bio">
            <Input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Short bio"
            />
          </Field>

          <Field label="About">
            <Textarea
              name="about"
              rows={3}
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell something about yourself"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location">
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </Field>

            <Field label="Website">
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </Field>
          </div>

          <Field label="Birthday">
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </Field>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-2">
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="ghost" className="cursor-pointer" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="bg-indigo-700 cursor-pointer hover:bg-indigo-600" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Field Component ---------------- */
function Field({
  label,
  children,
  error,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  helper?: string;
}) {
  return (
    <div className="w-full space-y-1.5 sm:space-y-2">
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      {children}

      {helper && !error && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
