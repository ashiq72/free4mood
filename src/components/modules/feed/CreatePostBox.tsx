"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ImageIcon, Smile, Video } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createPost } from "@/lib/api/post/post";
import { useUser } from "@/context/UserContext";

export const CreatePostBox = () => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // 👉 handle image selection
  const handleFileChange = (e: any) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const title = `${user?.name}`;

      // ⭐ MUST USE FormData for image upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (file) {
        formData.append("file", file); // MUST MATCH multer.single("file")
      }

      await createPost(formData);

      toast.success("Post created!");

      setDescription("");
      setFile(null);
      setPreview(null);
      setOpen(false);

      // reload feed
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={() => {
            if (!user) {
              window.location.href = "/login";
              return;
            }
          }}
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-2xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Image
            src="https://picsum.photos/200?random=41"
            width={40}
            height={40}
            className="rounded-full"
            alt="User avatar"
          />
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-zinc-500">
            What is on your mind?
          </div>
        </div>
      </PopoverTrigger>

      {/* POPUP */}
      <PopoverContent
        side="bottom"
        align="center"
        className="w-[350px] sm:w-[420px] md:w-[670px] rounded-2xl p-0 border-none shadow-2xl bg-white dark:bg-zinc-900"
      >
        <AnimatePresence>
          {open && (
            <motion.form
              onSubmit={handleCreatePost}
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.18 }}
              className="p-5 space-y-4"
              encType="multipart/form-data"
            >
              {/* TEXT INPUT */}
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your post..."
                className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3 resize-none outline-none"
              />

              {/* IMAGE PREVIEW */}
              {preview && (
                <div className="w-full">
                  <Image
                    src={preview}
                    width={600}
                    height={400}
                    alt="Preview"
                    className="rounded-xl object-cover max-h-[300px] w-full"
                  />
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
                  {/* IMAGE UPLOAD BUTTON */}
                  <label className="cursor-pointer">
                    <ImageIcon size={22} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <Video size={20} />
                  <Smile size={20} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};
