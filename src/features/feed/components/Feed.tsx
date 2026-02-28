"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addPostComment,
  deletePost,
  deletePostComment,
  getAllPosts,
  getMyPosts,
  getUserPosts,
  togglePostLike,
  updatePostComment,
  updatePost,
} from "@/lib/api/post";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "@/shared/components/FeedSkeleton";
import type { Post } from "@/features/feed/types";
import { toast } from "sonner";
import { useUser } from "@/shared/context/UserContext";
import { createReport, toggleBlockUser } from "@/lib/api/social";

type FeedProps = {
  scope?: "all" | "my" | "user";
  targetUserId?: string;
};

export const Feed = ({ scope = "all", targetUserId }: FeedProps) => {
  const PAGE_SIZE = 10;
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [commentLoadingId, setCommentLoadingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const normalizeId = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
      const record = value as Record<string, unknown>;
      if (typeof record._id === "string") return record._id;
      if (typeof record.id === "string") return record.id;
      if (typeof record.$oid === "string") return record.$oid;
    }
    if (typeof (value as { toString?: () => string }).toString === "function") {
      const raw = (value as { toString: () => string }).toString();
      return raw && raw !== "[object Object]" ? raw : "";
    }
    return "";
  };

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
            : scope === "user" && targetUserId
              ? await getUserPosts(targetUserId, {
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
    [scope, targetUserId],
  );

  useEffect(() => {
    if (!user?.userId) {
      setPosts([]);
      setCursor(null);
      setHasMore(false);
      setLoading(false);
      return;
    }
    if (scope === "user" && !targetUserId) {
      setPosts([]);
      setCursor(null);
      setHasMore(false);
      setLoading(false);
      return;
    }
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    void loadPosts("reset", null);
  }, [scope, targetUserId, loadPosts, user?.userId]);

  useEffect(() => {
    const handlePostCreated = () => {
      if (!user?.userId) return;
      if (scope === "user" && !targetUserId) return;
      setPosts([]);
      setCursor(null);
      setHasMore(true);
      void loadPosts("reset", null);
    };

    window.addEventListener("post:created", handlePostCreated);
    return () => {
      window.removeEventListener("post:created", handlePostCreated);
    };
  }, [loadPosts, scope, targetUserId, user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;
    if (scope === "user" && !targetUserId) return;
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
  }, [
    hasMore,
    loading,
    loadingMore,
    loadPosts,
    cursor,
    scope,
    targetUserId,
    user?.userId,
  ]);

  const replacePost = (updated?: Post) => {
    const updatedId = normalizeId(updated?._id);
    if (!updatedId) return;
    const nextPost = updated as Post;
    setPosts((prev) =>
      prev.map((item) =>
        normalizeId(item._id) === updatedId ? nextPost : item,
      ),
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

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setActionLoadingId(`comment-${commentId}`);
    try {
      const res = await deletePostComment(postId, commentId);
      setPosts((prev) =>
        prev.map((post) => {
          if (normalizeId(post._id) !== normalizeId(postId)) return post;
          if (!Array.isArray(post.comments)) return post;
          return {
            ...post,
            comments: post.comments.filter((comment: any) => {
              const id = normalizeId(comment?._id) || normalizeId(comment?.id);
              return id !== normalizeId(commentId);
            }),
          };
        }),
      );
      replacePost(res.data);
      toast.success("Comment deleted");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete comment";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateComment = async (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    setActionLoadingId(`comment-edit-${commentId}`);
    try {
      const res = await updatePostComment(postId, commentId, text);
      replacePost(res.data);
      toast.success("Comment updated");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update comment";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdatePost = async (postId: string, text: string) => {
    setActionLoadingId(`post-${postId}`);
    try {
      const res = await updatePost(postId, { text });
      replacePost(res.data);
      toast.success("Post updated");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update post";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setActionLoadingId(`post-${postId}`);
    try {
      await deletePost(postId);
      setPosts((prev) =>
        prev.filter((item) => normalizeId(item._id) !== normalizeId(postId)),
      );
      toast.success("Post deleted");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReportPost = async (postId: string) => {
    setActionLoadingId(`report-${postId}`);
    try {
      await createReport({
        targetType: "post",
        targetId: postId,
        reason: "Inappropriate content",
      });
      toast.success("Post reported");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to report post";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    setActionLoadingId(`block-${targetUserId}`);
    try {
      const res = await toggleBlockUser(targetUserId);
      if (res.data?.isBlocked) {
        setPosts((prev) =>
          prev.filter((post) => {
            const authorId =
              typeof post.user === "object" && post.user
                ? post.user._id
                : undefined;
            return authorId !== targetUserId;
          }),
        );
      }
      toast.success(res.data?.isBlocked ? "User blocked" : "User unblocked");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update block state";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user?.userId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
        Please <Link href="/login" className="text-blue-600 hover:underline">login</Link> to see your feed.
      </div>
    );
  }

  if (loading) return <FeedSkeleton />;
  return (
    <div className="space-y-2 pb-6">
      {posts.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
          No posts found.
        </div>
      )}
      {posts.map((post, index) => {
        const authorId =
          typeof post.user === "object" && post.user ? post.user._id : undefined;
        const userName =
          typeof post.user === "object" && post.user
            ? post.user.name || "Unknown"
            : typeof post.user === "string"
              ? post.user
              : "Unknown";
        const userImage =
          typeof post.user === "object" && post.user
            ? post.user.profileImage || (post.user as { image?: string }).image
            : undefined;
        const likedByMe =
          Array.isArray(post.likes) && !!user?.userId
            ? post.likes.some((id) => String(id) === String(user.userId))
            : false;
        return (
        <PostCard
          key={post._id ?? `${post.text}-${index}`}
          postId={post._id}
          authorId={authorId}
          userImage={userImage}
          currentUserId={user?.userId}
          user={userName}
          time={post.createdAt}
          content={post.text}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
          onLike={handleLike}
          onCommentSubmit={handleCommentSubmit}
          onDeleteComment={handleDeleteComment}
          onUpdateComment={handleUpdateComment}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onReportPost={handleReportPost}
          onBlockUser={handleBlockUser}
          likeLoading={likeLoadingId === post._id}
          commentLoading={commentLoadingId === post._id}
          actionLoading={actionLoadingId === `post-${post._id}` || actionLoadingId === `report-${post._id}` || actionLoadingId === `block-${authorId}`}
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
