"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { addPostComment, getAllPosts, getMyPosts, togglePostLike } from "@/lib/api/post";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "@/shared/components/FeedSkeleton";
import type { Post } from "@/features/feed/types";
import { toast } from "sonner";
import { useUser } from "@/shared/context/UserContext";

type FeedProps = {
  scope?: "all" | "my";
};

export const Feed = ({ scope = "all" }: FeedProps) => {
  const PAGE_SIZE = 10;
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [commentLoadingId, setCommentLoadingId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = useCallback(
    async (mode: "reset" | "more", cursorValue?: string | null) => {
      try {
        if (mode === "reset") {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const res =
          scope === "my"
            ? await getMyPosts({
                limit: PAGE_SIZE,
                cursor: mode === "more" ? cursorValue || undefined : undefined,
              })
            : await getAllPosts({
                limit: PAGE_SIZE,
                cursor: mode === "more" ? cursorValue || undefined : undefined,
              });

        const items = Array.isArray(res.data) ? res.data : [];
        const meta = (res.meta || {}) as {
          hasMore?: boolean;
          nextCursor?: string | null;
        };

        setHasMore(Boolean(meta.hasMore));
        setCursor(meta.nextCursor ?? null);
        setPosts((prev) => {
          if (mode === "reset") return items;
          const seen = new Set(prev.map((p) => p._id));
          const merged = [...prev];
          items.forEach((item) => {
            if (!item._id || !seen.has(item._id)) {
              merged.push(item);
            }
          });
          return merged;
        });
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        if (mode === "reset") {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [scope],
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    void loadPosts("reset", null);
  }, [scope, loadPosts]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          void loadPosts("more", cursor);
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPosts, cursor]);

  const replacePost = (updated?: Post) => {
    if (!updated?._id) return;
    setPosts((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item)),
    );
  };

  const handleLike = async (postId: string) => {
    setLikeLoadingId(postId);
    try {
      const res = await togglePostLike(postId);
      replacePost(res.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update like";
      toast.error(message);
    } finally {
      setLikeLoadingId(null);
    }
  };

  const handleCommentSubmit = async (postId: string, text: string) => {
    setCommentLoadingId(postId);
    try {
      const res = await addPostComment(postId, text);
      replacePost(res.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add comment";
      toast.error(message);
    } finally {
      setCommentLoadingId(null);
    }
  };

  if (loading) return <FeedSkeleton />;
  return (
    <div className="space-y-2 pb-6">
      {posts.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
          No posts found.
        </div>
      )}
      {posts.map((post, index) => {
        const userName =
          typeof post.user === "object" && post.user
            ? post.user.name || "Unknown"
            : typeof post.user === "string"
              ? post.user
              : "Unknown";
        const likedByMe =
          Array.isArray(post.likes) && !!user?.userId
            ? post.likes.some((id) => String(id) === String(user.userId))
            : false;
        return (
        <PostCard
          key={post._id ?? `${post.text}-${index}`}
          postId={post._id}
          user={userName}
          time={post.createdAt}
          content={post.text}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
          onLike={handleLike}
          onCommentSubmit={handleCommentSubmit}
          likeLoading={likeLoadingId === post._id}
          commentLoading={commentLoadingId === post._id}
          liked={likedByMe}
        />
        );
      })}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}
      {loadingMore && (
        <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-300">
          Loading more posts...
        </div>
      )}
    </div>
  );
};
