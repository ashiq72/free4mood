"use client";

import { Button } from "@/components/ui/button";
import { updateUser } from "@/lib/api/user/user";
import { useEffect, useState } from "react";

/* ---------------- Types ---------------- */
interface EditProfileFullModalProps {
  openFullModal: boolean;
  onClose: () => void;
  loadUser: () => void
}

interface FormDataType {
  bio: string;
  about: string;
  location: string;
  website: string;
  date: string;
}

/* ---------------- Helper ---------------- */
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------- Component ---------------- */
export default function EditProfileFullModal({
  openFullModal,
  onClose,
  loadUser

}: EditProfileFullModalProps) {
  const [formData, setFormData] = useState<FormDataType>({
    bio: "",
    about: "",
    location: "",
    website: "",
    date: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /* Handle change */
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

      await updateUser({
        bio: formData.bio,
        about: formData.about,
        location: formData.location,
        website: formData.website,
        date: formData.date,
      });

      // ⏳ keep saving state for 2 seconds
      await sleep(2000);
loadUser();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Bio">
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              className="input"
              placeholder="Short bio"
            />
          </Field>

          <Field label="About">
            <textarea
              name="about"
              rows={3}
              value={formData.about}
              onChange={handleChange}
              className="input"
              placeholder="Tell something about yourself"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location">
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="City, Country"
              />
            </Field>

            <Field label="Website">
              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com"
              />
            </Field>
          </div>

          <Field label="Birthday">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input"
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
          <Button className=" cursor-pointer" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : (<span >Save Changes</span>)}
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
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}
                