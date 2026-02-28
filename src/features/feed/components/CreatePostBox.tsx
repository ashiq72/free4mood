"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ImageIcon, Smile, Video, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createPost } from "@/lib/api/post";
import { useUser } from "@/shared/context/UserContext";
import { QUICK_EMOJIS } from "@/features/feed/constants/emoji";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/user";
import type { IUserInfo } from "@/features/profile/types";

export const CreatePostBox = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-avatar.svg");
  const { user } = useUser();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
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
        if (!active) return;
        setProfileImage(res.data?.image || "/default-avatar.svg");
      } catch {
        if (!active) return;
        setProfileImage("/default-avatar.svg");
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user?.userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const clearSelectedMedia = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const resetDraft = () => {
    setDescription("");
    clearSelectedMedia();
    setShowEmojiPicker(false);
  };

  const handleCancel = () => {
    resetDraft();
    setOpen(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Write something before posting");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", trimmed);

      if (file) {
        formData.append("file", file);
      }

      await createPost(formData);
      toast.success("Post created successfully");

      resetDraft();
      setOpen(false);

      window.dispatchEvent(new CustomEvent("post:created"));
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setShowEmojiPicker(false);
      }}
    >
      <DialogTrigger asChild>
        <div
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              router.push("/login");
            }
          }}
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <img
            src={profileImage}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            alt="User avatar"
          />
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-500">
            {"What's on your mind?"}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="w-[96vw] max-w-2xl rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <DialogHeader className="border-b border-gray-200 p-4 dark:border-zinc-800">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900 dark:text-white">
            Create post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreatePost} className="p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-3">
            <img
              src={profileImage}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
              alt="User avatar"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || "You"}
              </p>
              <p className="text-xs text-gray-500">Public</p>
            </div>
          </div>

          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`}
            className="w-full min-h-[140px] sm:min-h-[170px] bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 resize-none outline-none text-sm sm:text-base"
          />

          {preview && (
            <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-black/80 dark:border-zinc-700">
              <button
                type="button"
                onClick={clearSelectedMedia}
                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative aspect-[16/9] w-full">
                {file?.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    controls
                    className="h-full w-full bg-black object-contain"
                  />
                ) : (
                  <Image
                    src={preview}
                    width={1280}
                    height={720}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-3 dark:border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Add to your post
              </p>
              {file && (
                <span className="truncate text-xs text-gray-500">
                  {file.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 cursor-pointer dark:bg-green-900/20 dark:text-green-300">
                <ImageIcon className="h-4 w-4" />
                Photo
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <button
                type="button"
                onClick={() => toast.info("Video upload will be available soon")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 cursor-pointer dark:bg-blue-900/20 dark:text-blue-300"
              >
                <Video className="h-4 w-4" />
                Video
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300"
              >
                <Smile className="h-4 w-4" />
                Feeling
              </button>
            </div>
          </div>

          {showEmojiPicker && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setDescription((prev) => `${prev}${emoji}`)}
                    className="rounded-md p-1 text-lg hover:bg-white dark:hover:bg-zinc-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              {description.trim().length}/2000
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="min-w-[90px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="min-w-[110px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
