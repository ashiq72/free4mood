"use client";

import { useEffect } from "react";

export default function EditProfileFullModal({
  openFullModal,
  onClose,
  children,
}: any) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ❗ Freeze body scroll when modal is openFullModal
  useEffect(() => {
    if (openFullModal) {
      document.body.style.overflow = "hidden"; // disable scroll
    } else {
      document.body.style.overflow = "auto"; // enable scroll
    }

    // On unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openFullModal]);

  if (!openFullModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-[95%] sm:w-[420px] md:w-[650px] shadow-2xl relative animate-in fade-in zoom-in-50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
