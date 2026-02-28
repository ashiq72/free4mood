import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Smile,
  Users,
} from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QUICK_EMOJIS } from "@/features/feed/constants/emoji";
import { ActionButton } from "./ActionButton";

type CommentItem = {
  _id?: string;
  id?: string;
  user?: { _id?: string; name?: string } | string;
  text?: string;
  createdAt?: string;
};

type PostCardProps = {
  postId?: string;
  authorId?: string;
  currentUserId?: string;
  user: string;
  time?: string;
  content: string;
  image?: string;
  likes?: number | string[];
  comments?: number | CommentItem[];
  onLike?: (postId: string) => Promise<void> | void;
  onCommentSubmit?: (postId: string, text: string) => Promise<void> | void;
  onDeleteComment?: (postId: string, commentId: string) => Promise<void> | void;
  onUpdatePost?: (postId: string, text: string) => Promise<void> | void;
  onDeletePost?: (postId: string) => Promise<void> | void;
  onReportPost?: (postId: string) => Promise<void> | void;
  onBlockUser?: (userId: string) => Promise<void> | void;
  likeLoading?: boolean;
  commentLoading?: boolean;
  actionLoading?: boolean;
  liked?: boolean;
  defaultShowCommentBox?: boolean;
  commentsAnchorId?: string;
};

const toCount = (value?: number | unknown[]) =>
  Array.isArray(value) ? value.length : value ?? 0;

const normalizeCommentId = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record._id === "string") return record._id;
    if (typeof record.id === "string") return record.id;
    if (typeof record.$oid === "string") return record.$oid;
  }

  if (typeof (value as { toString?: () => string }).toString === "function") {
    const raw = (value as { toString: () => string }).toString();
    return raw && raw !== "[object Object]" ? raw : undefined;
  }

  return undefined;
};

export const PostCard = ({
  postId,
  authorId,
  currentUserId,
  user,
  time,
  content,
  image,
  likes,
  comments,
  onLike,
  onCommentSubmit,
  onDeleteComment,
  onUpdatePost,
  onDeletePost,
  onReportPost,
  onBlockUser,
  likeLoading = false,
  commentLoading = false,
  actionLoading = false,
  liked = false,
  defaultShowCommentBox = false,
  commentsAnchorId,
}: PostCardProps) => {
  const [showCommentBox, setShowCommentBox] = useState(defaultShowCommentBox);
  const [commentText, setCommentText] = useState("");
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(content);

  const likesCount = toCount(likes);
  const commentsCount = toCount(comments);
  const commentList = useMemo(
    () => (Array.isArray(comments) ? comments.slice(-3) : []),
    [comments],
  );

  const canManagePost = Boolean(
    postId && currentUserId && authorId && currentUserId === authorId,
  );
  const authorProfileHref = authorId ? `/profile/${authorId}` : null;

  const handleCommentSubmit = async () => {
    if (!postId || !onCommentSubmit) return;
    const text = commentText.trim();
    if (!text) return;
    await onCommentSubmit(postId, text);
    setCommentText("");
    setShowCommentEmojiPicker(false);
  };

  const handleSavePost = async () => {
    if (!postId || !onUpdatePost) return;
    const next = draftText.trim();
    if (!next) return;
    await onUpdatePost(postId, next);
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Image
            width={35}
            height={35}
            src="https://picsum.photos/200?random=41"
            alt="User"
            className="rounded-full object-cover"
          />
          <div>
            {authorProfileHref ? (
              <Link
                href={authorProfileHref}
                className="font-bold text-gray-900 dark:text-white text-sm hover:underline cursor-pointer"
              >
                {user}
              </Link>
            ) : (
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                {user}
              </h4>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>
                {time ? dayjs(time).format("MMM DD, YYYY - h:mm A") : "Just now"}
              </span>
              <span>-</span>
              <Users className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-20">
              {canManagePost && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Edit post
                </button>
              )}
              {canManagePost && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (!postId || !onDeletePost) return;
                    void onDeletePost(postId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Delete post
                </button>
              )}
              {!canManagePost && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (!postId || !onReportPost) return;
                    void onReportPost(postId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Report post
                </button>
              )}
              {!canManagePost && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (!authorId || !onBlockUser) return;
                    void onBlockUser(authorId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Block user
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraftText(content);
                }}
                className="rounded-md border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !draftText.trim()}
                onClick={() => void handleSavePost()}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-normal">{content}</p>
        )}
      </div>

      {image && (
        <div className="bg-gray-100 dark:bg-black">
          <Image
            src={image}
            alt="Content"
            width={800}
            height={500}
            className="w-full h-auto max-h-[300px] md:max-h-[400px] object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 p-1 rounded-full">
            <Heart className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <span className="hover:underline cursor-pointer">{likesCount} Likes</span>
        </div>
        <div className="flex gap-3">
          <span className="hover:underline cursor-pointer">{commentsCount} Comments</span>
        </div>
      </div>

      {commentsAnchorId ? <div id={commentsAnchorId} /> : null}

      {commentList.length > 0 && (
        <div className="px-4 py-2 space-y-2 border-b border-gray-100 dark:border-zinc-800">
          {commentList.map((item, idx) => {
            const commentId = normalizeCommentId(item._id) || normalizeCommentId(item.id);
            const commenter =
              typeof item.user === "object" && item.user
                ? item.user.name || "User"
                : typeof item.user === "string"
                  ? item.user
                  : "User";
            const commentOwnerId =
              typeof item.user === "object" && item.user ? item.user._id : undefined;
            const canDeleteComment =
              Boolean(postId && commentId && currentUserId) &&
              (commentOwnerId === currentUserId || canManagePost);
            const commenterProfileHref = commentOwnerId
              ? `/profile/${commentOwnerId}`
              : null;

            return (
              <div key={commentId || `${commenter}-${idx}`} className="flex items-start justify-between gap-3 text-sm text-gray-700 dark:text-gray-200">
                <div>
                  {commenterProfileHref ? (
                    <Link
                      href={commenterProfileHref}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      {commenter}
                    </Link>
                  ) : (
                    <span className="font-semibold">{commenter}</span>
                  )}
                  <span>: </span>
                  <span>{item.text || ""}</span>
                </div>
                {canDeleteComment && (
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => {
                      if (!postId || !commentId || !onDeleteComment) return;
                      void onDeleteComment(postId, commentId);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCommentBox && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="h-9 w-full rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 pr-10 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCommentEmojiPicker((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={commentLoading || !commentText.trim()}
              onClick={() => void handleCommentSubmit()}
              className="h-9 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              {commentLoading ? "..." : "Post"}
            </button>
          </div>
          {showCommentEmojiPicker && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="grid grid-cols-8 gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCommentText((prev) => `${prev}${emoji}`)}
                    className="rounded p-1 text-base hover:bg-white dark:hover:bg-zinc-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-2 py-1 flex items-center justify-between cursor-pointer">
        <ActionButton
          icon={Heart}
          label="Like"
          className="cursor-pointer"
          onClick={() => {
            if (!postId || !onLike) return;
            void onLike(postId);
          }}
          disabled={likeLoading}
          active={liked}
        />
        <ActionButton
          className="cursor-pointer"
          icon={MessageCircle}
          label="Comment"
          onClick={() =>
            setShowCommentBox((prev) => {
              const next = !prev;
              if (!next) setShowCommentEmojiPicker(false);
              return next;
            })
          }
        />
        <ActionButton className="cursor-pointer" icon={Share2} label="Share" />
      </div>
    </div>
  );
};
