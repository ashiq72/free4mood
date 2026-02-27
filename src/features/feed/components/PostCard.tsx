import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Users,
} from "lucide-react";
import { ActionButton } from "./ActionButton";
import dayjs from "dayjs";
import Image from "next/image";
import { useMemo, useState } from "react";

type PostCardProps = {
  postId?: string;
  user: string;
  time?: string;
  content: string;
  image?: string;
  likes?: number | string[];
  comments?:
    | number
    | {
        user?: { _id?: string; name?: string } | string;
        text?: string;
        createdAt?: string;
      }[];
  onLike?: (postId: string) => Promise<void> | void;
  onCommentSubmit?: (postId: string, text: string) => Promise<void> | void;
  likeLoading?: boolean;
  commentLoading?: boolean;
  liked?: boolean;
};

const toCount = (value?: number | unknown[]) =>
  Array.isArray(value) ? value.length : value ?? 0;

export const PostCard = ({
  postId,
  user,
  time,
  content,
  image,
  likes,
  comments,
  onLike,
  onCommentSubmit,
  likeLoading = false,
  commentLoading = false,
  liked = false,
}: PostCardProps) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const likesCount = toCount(likes);
  const commentsCount = toCount(comments);
  const commentList = useMemo(
    () => (Array.isArray(comments) ? comments.slice(-2) : []),
    [comments],
  );

  const handleCommentSubmit = async () => {
    if (!postId || !onCommentSubmit) return;
    const text = commentText.trim();
    if (!text) return;
    await onCommentSubmit(postId, text);
    setCommentText("");
  };

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden'>
      <div className='p-4 flex justify-between items-start'>
        <div className='flex items-center gap-3'>
          <Image
            width={35}
            height={35}
            src='https://picsum.photos/200?random=41'
            alt='User'
            className='rounded-full object-cover'
          />
          <div>
            <h4 className='font-bold text-gray-900 dark:text-white text-sm hover:underline cursor-pointer'>
              {user}
            </h4>
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <span>
                {time ? dayjs(time).format("MMM DD, YYYY - h:mm A") : "Just now"}
              </span>
              <span>•</span>
              <Users className='w-3 h-3' />
            </div>
          </div>
        </div>
        <button className='p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 cursor-pointer'>
          <MoreHorizontal className='w-5 h-5' />
        </button>
      </div>

      <div className='px-4 pb-3'>
        <p className='text-gray-800 dark:text-gray-200 text-sm leading-normal'>
          {content}
        </p>
      </div>

      {image && (
        <div className='bg-gray-100 dark:bg-black'>
          <Image
            src={image}
            alt='Content'
            width={800} // you can adjust size
            height={500}
            className='w-full h-auto max-h-[300px] md:max-h-[400px] object-cover'
            unoptimized // important for external image URLs
          />
        </div>
      )}

      <div className='px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 dark:border-zinc-800'>
        <div className='flex items-center gap-1'>
          <div className='bg-blue-500 p-1 rounded-full'>
            <Heart className='w-2.5 h-2.5 text-white fill-current' />
          </div>
          <span className='hover:underline cursor-pointer'>
            {likesCount} Likes
          </span>
        </div>
        <div className='flex gap-3'>
          <span className='hover:underline cursor-pointer'>
            {commentsCount} Comments
          </span>
          <span className='hover:underline cursor-pointer'>12 Shares</span>
        </div>
      </div>

      {commentList.length > 0 && (
        <div className='px-4 py-2 space-y-2 border-b border-gray-100 dark:border-zinc-800'>
          {commentList.map((item, idx) => {
            const commenter =
              typeof item.user === "object" && item.user
                ? item.user.name || "User"
                : typeof item.user === "string"
                  ? item.user
                  : "User";
            return (
              <div key={`${commenter}-${idx}`} className='text-sm text-gray-700 dark:text-gray-200'>
                <span className='font-semibold'>{commenter}: </span>
                <span>{item.text || ""}</span>
              </div>
            );
          })}
        </div>
      )}

      {showCommentBox && (
        <div className='px-3 py-2 border-b border-gray-100 dark:border-zinc-800'>
          <div className='flex items-center gap-2'>
            <input
              type='text'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder='Write a comment...'
              className='h-9 w-full rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm outline-none'
            />
            <button
              type='button'
              disabled={commentLoading || !commentText.trim()}
              onClick={handleCommentSubmit}
              className='h-9 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer'
            >
              {commentLoading ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}

      <div className='px-2 py-1 flex items-center justify-between cursor-pointer'>
        <ActionButton
          icon={Heart}
          label='Like'
          className='cursor-pointer'
          onClick={() => {
            if (!postId || !onLike) return;
            void onLike(postId);
          }}
          disabled={likeLoading}
          active={liked}
        />
        <ActionButton
          className='cursor-pointer'
          icon={MessageCircle}
          label='Comment'
          onClick={() => setShowCommentBox((prev) => !prev)}
        />
        <ActionButton className='cursor-pointer' icon={Share2} label='Share' />
      </div>
    </div>
  );
};
