"use client";
import { useEffect, useState } from "react";
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
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [commentLoadingId, setCommentLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = scope === "my" ? await getMyPosts() : await getAllPosts();
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [scope]);

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
    </div>
  );
};
