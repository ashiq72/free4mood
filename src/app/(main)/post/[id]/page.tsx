"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PostCard } from "@/features/feed/components/PostCard";
import type { Post } from "@/features/feed/types";
import {
  addPostComment,
  deletePost,
  deletePostComment,
  getPostById,
  togglePostLike,
  updatePostComment,
  updatePost,
} from "@/lib/api/post";
import { createReport, toggleBlockUser } from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";

const COMMENTS_ANCHOR_ID = "comments";

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

export default function PostDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { user } = useUser();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [commentLoadingId, setCommentLoadingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const postId = useMemo(() => decodeURIComponent(rawId || "").trim(), [rawId]);

  useEffect(() => {
    if (!user?.userId || !postId) {
      setLoading(false);
      setPost(null);
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPostById(postId);
        if (!active) return;
        setPost(res.data || null);
      } catch (error: unknown) {
        if (!active) return;
        setPost(null);
        const message =
          error instanceof Error ? error.message : "Failed to load post";
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [postId, user?.userId]);

  useEffect(() => {
    if (!post?._id) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== `#${COMMENTS_ANCHOR_ID}`) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(COMMENTS_ANCHOR_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [post?._id]);

  const replacePost = (nextPost?: Post) => {
    if (!nextPost?._id) return;
    setPost(nextPost);
  };

  const handleLike = async (targetPostId: string) => {
    setLikeLoadingId(targetPostId);
    try {
      const res = await togglePostLike(targetPostId);
      replacePost(res.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update like";
      toast.error(message);
    } finally {
      setLikeLoadingId(null);
    }
  };

  const handleCommentSubmit = async (targetPostId: string, text: string) => {
    setCommentLoadingId(targetPostId);
    try {
      const res = await addPostComment(targetPostId, text);
      replacePost(res.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add comment";
      toast.error(message);
    } finally {
      setCommentLoadingId(null);
    }
  };

  const handleDeleteComment = async (
    targetPostId: string,
    commentId: string,
  ) => {
    setActionLoadingId(`comment-${commentId}`);
    try {
      const res = await deletePostComment(targetPostId, commentId);
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
    targetPostId: string,
    commentId: string,
    text: string,
  ) => {
    setActionLoadingId(`comment-edit-${commentId}`);
    try {
      const res = await updatePostComment(targetPostId, commentId, text);
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

  const handleUpdatePost = async (targetPostId: string, text: string) => {
    setActionLoadingId(`post-${targetPostId}`);
    try {
      const res = await updatePost(targetPostId, { text });
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

  const handleDeletePost = async (targetPostId: string) => {
    setActionLoadingId(`post-${targetPostId}`);
    try {
      await deletePost(targetPostId);
      toast.success("Post deleted");
      router.replace("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
      setActionLoadingId(null);
    }
  };

  const handleReportPost = async (targetPostId: string) => {
    setActionLoadingId(`report-${targetPostId}`);
    try {
      await createReport({
        targetType: "post",
        targetId: targetPostId,
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
      toast.success(res.data?.isBlocked ? "User blocked" : "User unblocked");
      if (res.data?.isBlocked) {
        router.replace("/");
      }
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
      <div className="max-w-2xl mx-auto py-10 text-sm text-gray-500 dark:text-gray-300">
        Please <Link href="/login" className="text-blue-600 hover:underline">login</Link>{" "}
        to view this post.
      </div>
    );
  }

  if (!postId) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-sm text-gray-500 dark:text-gray-300">
        Invalid post id.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-sm text-gray-500 dark:text-gray-300">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-sm text-gray-500 dark:text-gray-300">
        Post not found.
      </div>
    );
  }

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
  const normalizedPostId = normalizeId(post._id);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <PostCard
        postId={post._id}
        authorId={authorId}
        userImage={userImage}
        currentUserId={user.userId}
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
        likeLoading={likeLoadingId === normalizedPostId}
        commentLoading={commentLoadingId === normalizedPostId}
        actionLoading={
          actionLoadingId === `post-${normalizedPostId}` ||
          actionLoadingId === `report-${normalizedPostId}` ||
          actionLoadingId === `block-${authorId}`
        }
        liked={likedByMe}
        defaultShowCommentBox
        commentsAnchorId={COMMENTS_ANCHOR_ID}
      />
    </div>
  );
}
