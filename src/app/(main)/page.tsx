"use client";

import {
  Users,
  Bookmark,
  Calendar,
  Clock,
  Video,
  Flag,
  ChevronDown,
  Search,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Smile,
  X,
} from "lucide-react";

export default function Home() {
  return (
    <div className='min-h-screen bg-[#F0F2F5] dark:bg-black pt-6'>
      <div className='flex justify-between max-w-[1920px] mx-auto px-0 sm:px-4 gap-8 relative'>
        {/* --- LEFT SIDEBAR (Navigation) --- */}
        {/* sticky ব্যবহার করা হয়েছে যাতে স্ক্রল করলেও এটি ফিক্সড থাকে */}
        <div className='hidden lg:block w-[280px] xl:w-[320px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar'>
          <LeftSidebar />
        </div>

        {/* --- MIDDLE (Feed & Stories) --- */}
        <div className='flex-1 min-w-0 max-w-[700px] mx-auto'>
          <Stories />
          <CreatePostBox />
          <Feed />
        </div>

        {/* --- RIGHT SIDEBAR (Contacts & Requests) --- */}
        <div className='hidden xl:block w-[280px] xl:w-[320px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar'>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS (Code Organization)
// -----------------------------------------------------------------------------

// 1. Left Sidebar Component
const LeftSidebar = () => {
  const menuItems = [
    { icon: Users, label: "Friends", color: "text-blue-500" },
    { icon: Clock, label: "Memories", color: "text-blue-400" },
    { icon: Bookmark, label: "Saved", color: "text-purple-500" },
    { icon: Flag, label: "Pages", color: "text-orange-500" },
    { icon: Video, label: "Video", color: "text-blue-600" },
    { icon: Calendar, label: "Events", color: "text-red-500" },
  ];

  return (
    <div className='space-y-6 pr-4'>
      {/* User Mini Profile */}
      <div className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer'>
        <img
          src='https://picsum.photos/200?random=41'
          alt='User'
          className='w-10 h-10 rounded-full'
        />
        <span className='font-semibold text-gray-900 dark:text-white'>
          Safayet Hossain
        </span>
      </div>

      {/* Menu Items */}
      <div className='space-y-1'>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className='flex items-center gap-4 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer group'
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className='font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white'>
              {item.label}
            </span>
          </div>
        ))}
        <div className='flex items-center gap-4 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer'>
          <div className='w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center'>
            <ChevronDown className='w-5 h-5 text-gray-700 dark:text-gray-300' />
          </div>
          <span className='font-medium text-gray-700 dark:text-gray-200'>
            See More
          </span>
        </div>
      </div>

      <div className='border-b border-gray-300 dark:border-zinc-700 my-2'></div>

      {/* Shortcuts */}
      <div>
        <h3 className='text-gray-500 font-semibold px-3 mb-2'>
          Your Shortcuts
        </h3>
        <div className='space-y-1'>
          {["Web Design Community", "Next.js Developers", "React BD"].map(
            (group, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer'
              >
                <img
                  src={`https://picsum.photos/100?random=${i + 10}`}
                  className='w-9 h-9 rounded-lg object-cover'
                  alt='Group'
                />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-200 truncate'>
                  {group}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// 2. Stories Component
const Stories = () => {
  return (
    <div className='relative mb-6'>
      <div className='flex gap-2 overflow-x-auto pb-2 no-scrollbar'>
        {/* Create Story Card */}
        <div className='min-w-[110px] h-[200px] rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm relative group cursor-pointer hover:opacity-90 transition-opacity'>
          <img
            src='https://picsum.photos/200?random=41'
            className='h-[75%] w-full object-cover'
            alt='Me'
          />
          <div className='absolute bottom-0 w-full h-[25%] bg-white dark:bg-zinc-800 flex flex-col items-center justify-center'>
            <span className='text-xs font-semibold dark:text-white mt-3'>
              Create Story
            </span>
          </div>
          <div className='absolute top-[65%] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-zinc-800 flex items-center justify-center'>
            <span className='text-white text-xl font-bold'>+</span>
          </div>
        </div>

        {/* Friends Stories */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className='min-w-[110px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group'
          >
            <img
              src={`https://picsum.photos/300?random=${i + 50}`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
              alt='Story'
            />
            <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors'></div>
            <div className='absolute top-3 left-3 w-9 h-9 rounded-full border-4 border-blue-600 overflow-hidden'>
              <img
                src={`https://picsum.photos/100?random=${i + 20}`}
                className='w-full h-full object-cover'
                alt='User'
              />
            </div>
            <span className='absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-md'>
              User Name
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Create Post Box
const CreatePostBox = () => {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 mb-6'>
      <div className='flex gap-3 mb-4'>
        <img
          src='https://picsum.photos/200?random=41'
          alt='User'
          className='w-10 h-10 rounded-full object-cover'
        />
        <input
          type='text'
          placeholder="What's on your mind, Safayet?"
          className='flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-5 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none dark:text-white'
        />
      </div>
      <div className='border-t border-gray-200 dark:border-zinc-800 pt-3 flex justify-between px-2'>
        <button className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors'>
          <Video className='w-6 h-6 text-red-500' />
          <span className='text-gray-600 dark:text-gray-300 font-medium text-sm'>
            Live Video
          </span>
        </button>
        <button className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors'>
          <ImageIcon className='w-6 h-6 text-green-500' />
          <span className='text-gray-600 dark:text-gray-300 font-medium text-sm'>
            Photo/Video
          </span>
        </button>
        <button className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors hidden sm:flex'>
          <Smile className='w-6 h-6 text-yellow-500' />
          <span className='text-gray-600 dark:text-gray-300 font-medium text-sm'>
            Feeling/Activity
          </span>
        </button>
      </div>
    </div>
  );
};

// 4. Feed (List of Posts)
const Feed = () => {
  return (
    <div className='space-y-6 pb-10'>
      <PostCard
        user='Bponi Official'
        time='2h ago'
        content='We are excited to announce our new partnership! Big things coming for the e-commerce sector.'
        image='https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop'
        likes={1200}
        comments={340}
      />
      <PostCard
        user='Rust Developers'
        time='5h ago'
        content='Just released a new crate for handling GraphQL schemas efficiently. Check it out on crates.io!'
        likes={450}
        comments={89}
      />
      <PostCard
        user='Safayet Hossain'
        time='1d ago'
        content='Working on a new dashboard design. The dark mode contrast is tricky but fun! 🎨'
        image='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2555&auto=format&fit=crop'
        likes={85}
        comments={12}
      />
    </div>
  );
};

// 5. Single Post Card
const PostCard = ({ user, time, content, image, likes, comments }: any) => {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden'>
      <div className='p-4 flex justify-between items-start'>
        <div className='flex items-center gap-3'>
          <img
            src={`https://picsum.photos/200?random=${Math.random()}`}
            alt='User'
            className='w-10 h-10 rounded-full object-cover'
          />
          <div>
            <h4 className='font-bold text-gray-900 dark:text-white text-sm hover:underline cursor-pointer'>
              {user}
            </h4>
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <span>{time}</span>
              <span>•</span>
              <Users className='w-3 h-3' />
            </div>
          </div>
        </div>
        <button className='p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500'>
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
          <img
            src={image}
            alt='Content'
            className='w-full h-auto max-h-[500px] object-cover'
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

      <div className='px-2 py-1 flex items-center justify-between'>
        <ActionButton icon={Heart} label='Like' />
        <ActionButton icon={MessageCircle} label='Comment' />
        <ActionButton icon={Share2} label='Share' />
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label }: any) => (
  <button className='flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group'>
    <Icon className='w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200' />
    <span className='text-sm font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'>
      {label}
    </span>
  </button>
);

// 6. Right Sidebar Component
const RightSidebar = () => {
  return (
    <div className='pl-4 space-y-6'>
      {/* Sponsored */}
      <div>
        <h3 className='text-gray-500 font-semibold mb-3 text-sm'>Sponsored</h3>
        <div className='flex items-center gap-3 p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer group'>
          <img
            src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop'
            alt='Ad'
            className='w-28 h-28 rounded-lg object-cover'
          />
          <div>
            <p className='font-semibold text-gray-900 dark:text-white text-sm group-hover:underline'>
              Nike Shoes
            </p>
            <p className='text-xs text-gray-500'>nike.com</p>
          </div>
        </div>
      </div>

      <div className='border-b border-gray-300 dark:border-zinc-700 my-2'></div>

      {/* Friend Requests */}
      <div>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-gray-500 font-semibold text-sm'>
            Friend Requests
          </h3>
          <span className='text-blue-500 text-sm cursor-pointer hover:underline'>
            See All
          </span>
        </div>
        <div className='bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm mb-2'>
          <div className='flex items-center gap-3 mb-3'>
            <img
              src='https://picsum.photos/200?random=88'
              className='w-12 h-12 rounded-full object-cover'
              alt='Requester'
            />
            <div>
              <p className='font-semibold text-sm text-gray-900 dark:text-white'>
                Kabir Singh
              </p>
              <p className='text-xs text-gray-500'>12 mutual friends</p>
            </div>
            <span className='ml-auto text-xs text-gray-400'>2d</span>
          </div>
          <div className='flex gap-2'>
            <button className='flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors'>
              Confirm
            </button>
            <button className='flex-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white text-sm font-medium py-1.5 rounded-lg transition-colors'>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className='border-b border-gray-300 dark:border-zinc-700 my-2'></div>

      {/* Contacts / Online Friends */}
      <div>
        <div className='flex justify-between items-center mb-2 px-2'>
          <h3 className='text-gray-500 font-semibold text-sm'>Contacts</h3>
          <div className='flex gap-2 text-gray-500'>
            <Search className='w-4 h-4 cursor-pointer hover:text-gray-700' />
            <MoreHorizontal className='w-4 h-4 cursor-pointer hover:text-gray-700' />
          </div>
        </div>
        <div className='space-y-1'>
          {[
            "Rakibul Hasan",
            "Mazharul Islam",
            "Sajeeb Ahmed",
            "Rahim Uddin",
          ].map((name, i) => (
            <div
              key={i}
              className='flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative'
            >
              <div className='relative'>
                <img
                  src={`https://picsum.photos/100?random=${i + 90}`}
                  className='w-9 h-9 rounded-full object-cover'
                  alt='Friend'
                />
                <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900'></div>
              </div>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
