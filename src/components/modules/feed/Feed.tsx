// "use client";
// import { useEffect, useState } from "react";
import { getAllPosts } from "@/lib/api/post";
import { PostCard } from "./PostCard";

export const Feed = async () => {
  const res = await getAllPosts();
  // const [posts, setPosts] = useState<any[]>([]);
  const posts = res.data; // 👉 এখানে array আছে

  // useEffect(() => {
  //   let mounted = true;

  //   const fetchPosts = async () => {
  //     try {
  //       const res = await fetch("http://localhost:4000/api/v1/posts/");
  //       if (!res.ok) return;
  //       const data = await res.json();
  //       if (mounted) setPosts(data.data); // তোমার API অনুযায়ী adjust করবে
  //     } catch (err) {
  //       console.error("Failed to fetch posts:", err);
  //     }
  //   };

  //   // call asynchronously to avoid synchronous setState in effect body
  //   fetchPosts();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  return (
    <div className="space-y-6 pb-10">
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
        user="Bponi Official"
        time="2h ago"
        content="We are excited to announce our new partnership! Big things coming for the e-commerce sector."
        image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
        likes={1200}
        comments={340}
      />
      <PostCard
        user="Rust Developers"
        time="5h ago"
        content="Just released a new crate for handling GraphQL schemas efficiently. Check it out on crates.io!"
        likes={450}
        comments={89}
      />
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
