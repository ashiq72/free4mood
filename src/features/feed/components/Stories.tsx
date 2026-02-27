"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/api/user";
import { createStory, deleteStory, getStoryFeed, type Story } from "@/lib/api/story";
import type { IUserInfo } from "@/features/profile/types";

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
    <div className="relative mb-2 mx-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectStoryFile}
        className="hidden"
      />

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
          className="min-w-[110px] h-[200px] rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm relative group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src={myStory?.image || myProfileImage}
            className="h-[75%] w-full object-cover"
            alt="My story"
          />

          <div className="absolute top-2 left-2 right-2 z-10 flex justify-between">
            <button
              type="button"
              onClick={openAddStory}
              disabled={addingStory}
              data-story-action="true"
              className="h-7 min-w-[28px] px-2 rounded-full bg-white/85 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-60"
            >
              {addingStory ? "..." : "+"}
            </button>

            {myStory && (
              <button
                type="button"
                onClick={handleRemoveStory}
                disabled={removingStory}
                data-story-action="true"
                className="h-7 min-w-[28px] px-2 rounded-full bg-black/60 text-xs font-semibold text-white hover:bg-black/80 disabled:opacity-60"
              >
                {removingStory ? "..." : "x"}
              </button>
            )}
          </div>

          <div className="absolute bottom-0 w-full h-[25%] bg-white dark:bg-zinc-800 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold dark:text-white mt-3">
              {createStoryLabel}
            </span>
          </div>

          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 h-10 w-10 rounded-full border-4 border-white dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <img
              src={myProfileImage}
              alt="My profile"
              className="h-full w-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
              {myStory ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="text-[10px] font-bold">+</span>
              )}
            </span>
          </div>
        </div>

        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[110px] h-[200px] rounded-xl bg-gray-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}

        {!loading &&
          friendStories.map((story) => (
            <div
              key={story.userId}
              onClick={() => setActiveStory(story)}
              className="min-w-[110px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
            >
              <img
                src={story.image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={`${story.userName} story`}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-full border-4 border-blue-600 overflow-hidden">
                <img
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

            <img
              src={activeStory.image}
              alt={`${activeStory.userName} story`}
              className="w-full max-h-[80vh] object-cover"
            />

            <div className="absolute top-3 left-3 flex items-center gap-2 text-white">
              <img
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-white">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

