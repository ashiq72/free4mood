"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Globe2,
  ImagePlus,
  Loader2,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPost } from "@/lib/api/post";
import { getMe } from "@/lib/api/user";
import { useUser } from "@/shared/context/UserContext";
import { QUICK_EMOJIS } from "@/features/feed/constants/emoji";
import type { IUserInfo } from "@/features/profile/types";
import { RemoteImage } from "@/shared/components/RemoteImage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DESCRIPTION_LIMIT = 2000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

const formatFileSize = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes < 0.1 ? megabytes.toFixed(2) : megabytes.toFixed(1)} MB`;
};

export const CreatePostBox = () => {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-avatar.svg");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!user?.userId) {
      setProfileImage("/default-avatar.svg");
      return;
    }

    let active = true;
    const loadProfile = async () => {
      try {
        const res = await getMe<IUserInfo>();
        if (active) {
          setProfileImage(res.data?.image || "/default-avatar.svg");
        }
      } catch {
        if (active) setProfileImage("/default-avatar.svg");
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user?.userId]);

  const clearSelectedMedia = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const selectImage = (selected?: File) => {
    if (!selected) return;
    if (!ALLOWED_IMAGE_TYPES.has(selected.type)) {
      toast.error("Choose a JPEG or PNG image");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const resetDraft = () => {
    setDescription("");
    clearSelectedMedia();
    setShowEmojiPicker(false);
    setDragActive(false);
  };

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = description.trim();
    if (!text) {
      toast.error("Write something before posting");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (file) formData.append("file", file);

      await createPost(formData);
      toast.success("Post created successfully");
      resetDraft();
      setOpen(false);
      window.dispatchEvent(new CustomEvent("post:created"));
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create post",
      );
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] || "friend";
  const remainingCharacters = DESCRIPTION_LIMIT - description.length;
  const hasDraft = Boolean(description.trim() || file);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return;
        setOpen(nextOpen);
        if (!nextOpen) {
          setShowEmojiPicker(false);
          setDragActive(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(event) => {
            if (!user) {
              event.preventDefault();
              router.push("/login");
            }
          }}
          className="group flex w-full items-center gap-3 rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-3 text-left transition hover:border-[var(--mood-jade)]"
        >
          <RemoteImage
            src={profileImage}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-md object-cover"
            alt=""
          />
          <span className="flex h-10 min-w-0 flex-1 items-center border-l border-[var(--mood-line)] px-4 text-sm text-[var(--mood-muted)]">
            Share today&apos;s mood or a thought...
          </span>
          <span className="hidden items-center gap-2 rounded-md bg-[var(--mood-surface-soft)] px-3 py-2 text-xs font-bold text-[var(--mood-jade)] sm:flex">
            <ImagePlus className="h-4 w-4" />
            Add visual
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(event) => {
          if (loading) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (loading) event.preventDefault();
        }}
        className="flex max-h-[92svh] w-[calc(100vw-1rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-0 shadow-2xl duration-300 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 dark:border-zinc-800 dark:bg-zinc-900 sm:w-[calc(100vw-2rem)]"
      >
        <DialogHeader className="relative shrink-0 border-b border-gray-200 px-5 py-4 text-left dark:border-zinc-800">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Create post
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            Share an update with your community.
          </DialogDescription>
          <button
            type="button"
            aria-label="Close create post"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form
          onSubmit={handleCreatePost}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center gap-3">
              <RemoteImage
                src={profileImage}
                width={44}
                height={44}
            className="h-11 w-11 rounded-md object-cover"
                alt=""
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name || "You"}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Globe2 className="h-3 w-3" />
                  Public
                </p>
              </div>
            </div>

            <textarea
              autoFocus
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onPaste={(event) => {
                const pastedImage = Array.from(event.clipboardData.files).find(
                  (item) => item.type.startsWith("image/"),
                );
                if (pastedImage) selectImage(pastedImage);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (event.ctrlKey || event.metaKey)
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={DESCRIPTION_LIMIT}
              placeholder={`What's on your mind, ${firstName}?`}
              aria-label="Post text"
              className="min-h-32 w-full resize-none bg-transparent px-1 py-2 text-base leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 dark:text-white sm:min-h-40 sm:text-lg"
            />

            <div className="mb-3 flex items-center justify-end">
              <span
                className={`text-xs tabular-nums ${
                  remainingCharacters < 100
                    ? "font-semibold text-amber-600 dark:text-amber-400"
                    : "text-gray-400"
                }`}
              >
                {remainingCharacters} remaining
              </span>
            </div>

            {preview && file && (
              <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-950 dark:border-zinc-700">
                <div className="relative flex max-h-[22rem] min-h-48 items-center justify-center">
                  <Image
                    src={preview}
                    width={1280}
                    height={960}
                    alt="Selected image preview"
                    className="max-h-[22rem] w-full object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    aria-label="Remove selected image"
                    onClick={clearSelectedMedia}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/60 px-3 py-2 text-xs text-gray-200">
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0">{formatFileSize(file.size)}</span>
                </div>
              </div>
            )}

            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) {
                  return;
                }
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                selectImage(event.dataTransfer.files?.[0]);
              }}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-3 transition ${
                dragActive
                  ? "border-[var(--mood-jade)] bg-[var(--mood-surface-soft)]"
                  : "border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800/50"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Add to your post
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drop, paste, or choose a JPEG/PNG up to 5 MB
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Add photo"
                  aria-label="Add photo"
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-green-600 transition hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/40"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(event) => {
                    selectImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  title="Add emoji"
                  aria-label="Add emoji"
                  aria-expanded={showEmojiPicker}
                  onClick={() => setShowEmojiPicker((current) => !current)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition ${
                    showEmojiPicker
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/40"
                  }`}
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Add ${emoji}`}
                      onClick={() =>
                        setDescription((current) =>
                          `${current}${emoji}`.slice(0, DESCRIPTION_LIMIT),
                        )
                      }
                      className="flex aspect-square items-center justify-center rounded-md text-lg transition hover:bg-white dark:hover:bg-zinc-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-5">
            <button
              type="button"
              onClick={() => {
                resetDraft();
                setOpen(false);
              }}
              disabled={loading || !hasDraft}
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-md bg-[var(--mood-coral)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--mood-coral-deep)] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
