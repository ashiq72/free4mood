"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/api/user";
import { createStory, deleteStory, getStoryFeed, type Story } from "@/lib/api/story";
import type { IUserInfo } from "@/features/profile/types";
import { RemoteImage } from "@/shared/components/RemoteImage";

type StoryCard = {
  id: string;
  image: string;
  caption?: string;
  createdAt?: string;
  userId: string;
  userName: string;
  userImage: string;
};

const FALLBACK_USER_IMAGE = "/default-avatar.svg";

const formatRelativeTime = (value?: string) => {
  if (!value) return "";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export const Stories = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [me, setMe] = useState<IUserInfo | null>(null);
  const [storyCards, setStoryCards] = useState<StoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStory, setAddingStory] = useState(false);
  const [removingStory, setRemovingStory] = useState(false);
  const [activeStory, setActiveStory] = useState<StoryCard | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, feedRes] = await Promise.allSettled([
        getMe<IUserInfo>(),
        getStoryFeed(),
      ]);

      if (meRes.status === "fulfilled") {
        setMe(meRes.value.data || null);
      } else {
        setMe(null);
      }

      if (feedRes.status === "fulfilled") {
        const cards = (Array.isArray(feedRes.value.data) ? feedRes.value.data : [])
          .filter((story: Story) => story._id && story.image)
          .map((story: Story) => ({
            id: story._id!,
            image: story.image!,
            caption: story.caption,
            createdAt: story.createdAt,
            userId: story.user?._id || "",
            userName: story.user?.name || "User",
            userImage: story.user?.image || FALLBACK_USER_IMAGE,
          }));

        setStoryCards(cards);
      } else {
        setStoryCards([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
    const refreshHandler = () => void loadStories();
    window.addEventListener("story:updated", refreshHandler);
    return () => window.removeEventListener("story:updated", refreshHandler);
  }, [loadStories]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveStory(null);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const myStory = useMemo(() => {
    const myId = me?._id || "";
    if (!myId) return null;
    return storyCards.find((story) => story.userId === myId) || null;
  }, [me?._id, storyCards]);

  const friendStories = useMemo(() => {
    const myId = me?._id || "";
    return storyCards.filter((story) => story.userId !== myId);
  }, [me?._id, storyCards]);

  const createStoryLabel = useMemo(() => {
    if (addingStory) return "Uploading...";
    return myStory ? "Your Story" : "Add Story";
  }, [addingStory, myStory]);

  const myProfileImage = me?.image || FALLBACK_USER_IMAGE;

  const handleSelectStoryFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image");
      event.target.value = "";
      return;
    }

    try {
      setAddingStory(true);
      const formData = new FormData();
      formData.append("file", selected);
      await createStory(formData);
      toast.success("Story added");
      await loadStories();
      window.dispatchEvent(new CustomEvent("story:updated"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add story";
      toast.error(message);
    } finally {
      setAddingStory(false);
      event.target.value = "";
    }
  };

  const handleRemoveStory = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!myStory?.id) return;

    try {
      setRemovingStory(true);
      await deleteStory(myStory.id);
      toast.success("Story removed");
      await loadStories();
      window.dispatchEvent(new CustomEvent("story:updated"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to remove story";
      toast.error(message);
    } finally {
      setRemovingStory(false);
    }
  };

  const openAddStory = (event: React.MouseEvent) => {
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <section className="relative mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectStoryFile}
        className="hidden"
      />

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase text-[var(--mood-muted)]">
          Moodline
        </h2>
        <span className="text-[11px] text-[var(--mood-muted)]">
          Moments fade after 24 hours
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        <div
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest("[data-story-action='true']")) return;
            if (myStory) {
              setActiveStory(myStory);
              return;
            }
            fileInputRef.current?.click();
          }}
          className="group relative h-[108px] min-w-[168px] overflow-hidden rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] cursor-pointer"
        >
          <RemoteImage
            src={myStory?.image || myProfileImage}
            className="h-full w-full object-cover opacity-30 transition group-hover:opacity-40"
            alt="My story"
          />

          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={openAddStory}
              disabled={addingStory}
              data-story-action="true"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--mood-ink)] text-white hover:bg-[var(--mood-coral)] disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {addingStory ? "..." : <Plus className="h-4 w-4" />}
            </button>
            <div>
              <span className="block text-xs font-bold text-[var(--mood-ink)]">
                {createStoryLabel}
              </span>
              <span className="block text-[10px] text-[var(--mood-muted)]">
                {myStory ? "Tap to view" : "Share a moment"}
              </span>
            </div>
          </div>

          {myStory && (
            <button
              type="button"
              onClick={handleRemoveStory}
              disabled={removingStory}
              data-story-action="true"
              aria-label="Remove your story"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/65 text-white hover:bg-black disabled:opacity-60"
            >
              {removingStory ? "..." : <X className="h-3.5 w-3.5" />}
            </button>
          )}

          {myStory && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold text-[var(--mood-jade)]">
              <Check className="h-3 w-3" />
              Live now
            </span>
          )}
        </div>

        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[108px] min-w-[168px] animate-pulse rounded-md bg-[var(--mood-surface-soft)]"
            />
          ))}

        {!loading &&
          friendStories.map((story) => (
            <div
              key={story.userId}
              onClick={() => setActiveStory(story)}
              className="group relative h-[108px] min-w-[168px] overflow-hidden rounded-md cursor-pointer"
            >
              <RemoteImage
                src={story.image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={`${story.userName} story`}
              />
              <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/25" />
              <div className="absolute left-3 top-3 h-8 w-8 overflow-hidden rounded-md border-2 border-[var(--mood-coral)]">
                <RemoteImage
                  src={story.userImage || FALLBACK_USER_IMAGE}
                  className="w-full h-full object-cover"
                  alt={story.userName}
                />
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow-md">
                <span className="block text-xs font-semibold truncate">
                  {story.userName}
                </span>
                <span className="block text-[10px] opacity-90">
                  {formatRelativeTime(story.createdAt)}
                </span>
              </div>
            </div>
          ))}
      </div>

      {activeStory && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveStory(null)}
              className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <RemoteImage
              src={activeStory.image}
              alt={`${activeStory.userName} story`}
              className="w-full max-h-[80vh] object-cover"
            />

            <div className="absolute top-3 left-3 flex items-center gap-2 text-white">
              <RemoteImage
                src={activeStory.userImage || FALLBACK_USER_IMAGE}
                alt={activeStory.userName}
                className="h-9 w-9 rounded-full object-cover border-2 border-white/80"
              />
              <div>
                <p className="text-sm font-semibold">{activeStory.userName}</p>
                <p className="text-xs opacity-90">
                  {formatRelativeTime(activeStory.createdAt)}
                </p>
              </div>
            </div>

            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-4 text-sm text-white">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

