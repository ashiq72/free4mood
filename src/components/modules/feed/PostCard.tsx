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

export const PostCard = ({
  user,
  time,
  content,
  image,
  likes,
  comments,
}: any) => {
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
              <span>{dayjs(time).format("MMM DD, YYYY - h:mm A")}</span>
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
          <span className='hover:underline cursor-pointer'>{likes} Likes</span>
        </div>
        <div className='flex gap-3'>
          <span className='hover:underline cursor-pointer'>
            {comments} Comments
          </span>
          <span className='hover:underline cursor-pointer'>12 Shares</span>
        </div>
      </div>

      <div className='px-2 py-1 flex items-center justify-between cursor-pointer'>
        <ActionButton icon={Heart} label='Like' className='cursor-pointer' />
        <ActionButton className='cursor-pointer' icon={MessageCircle} label='Comment' />
        <ActionButton className='cursor-pointer' icon={Share2} label='Share' />
      </div>
    </div>
  );
};
