"use client";
import { useEffect, useState } from "react";
import { getAllPosts } from "@/lib/api/post/post";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "@/components/shared/FeedSkeleton";

interface IPost {
  title: string;
  description: string;
  image?: string;
}

export const Feed = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await getAllPosts();
        setPosts(res.data);
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
      {posts.map((post: any) => (
        <PostCard
          key={post._id}
          user={post.title}
          time={post.createdAt}
          content={post.description}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
        />
      ))}
      
    
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
