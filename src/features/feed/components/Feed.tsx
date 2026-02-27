"use client";
import { useEffect, useState } from "react";
import { getAllPosts } from "@/lib/api/post";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "@/shared/components/FeedSkeleton";
import type { Post } from "@/features/feed/types";

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await getAllPosts();
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

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
        return (
        <PostCard
          key={post._id ?? `${post.text}-${index}`}
          user={userName}
          time={post.createdAt}
          content={post.text}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
        />
        );
      })}
      
    
      <PostCard
        user="Safayet Hossain"
        time="1d ago"
        content="Working on a new dashboard design. The dark mode contrast is tricky but fun! 🎨"
        image="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2555&auto=format&fit=crop"
        likes={85}
        comments={12}
      />
    </div>
  );
};
