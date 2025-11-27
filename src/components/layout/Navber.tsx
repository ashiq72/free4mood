"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Home,
  Tv,
  Users,
  Bell,
  MessageCircle,
  Menu,
  LogOut,
  Settings,
  User,
  PlusSquare,
} from "lucide-react";

// --- Components Helpers ---

// Nav Item Component for cleaner code
const NavItem = ({
  icon: Icon,
  active,
  href,
}: {
  icon: any;
  active?: boolean;
  href: string;
}) => (
  <Link
    href={href}
    className={`
      flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative
      ${
        active
          ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
      }
    `}
  >
    <Icon className={`w-6 h-6 ${active ? "fill-current" : "stroke-current"}`} />
    {/* Tooltip text could go here */}
    <span className='absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1'></span>
  </Link>
);

// Icon Button Component
const IconButton = ({
  icon: Icon,
  count,
  onClick,
}: {
  icon: any;
  count?: number;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className='relative p-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors'
  >
    <Icon className='w-5 h-5' />
    {count && count > 0 && (
      <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-black'>
        {count}
      </span>
    )}
  </button>
);

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userMenuItems = [
    { name: "Your Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Sign Out", href: "/logout", icon: LogOut },
  ];

  return (
    <div className='sticky top-0 z-50 w-full'>
      <nav className='bg-white/90 dark:bg-black/90 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800'>
        <div className='max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* --- Left Side: Logo & Search --- */}
            <div className='flex items-center gap-4 lg:gap-8 min-w-[200px]'>
              <Link href='/' className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl'>
                  F
                </div>
                <span className='hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400'>
                  Free4Mood
                </span>
              </Link>

              <div className='hidden md:flex items-center'>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Search className='h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  </div>
                  <input
                    type='text'
                    className='block w-64 pl-10 pr-3 py-2 border-none rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-black transition-all text-sm'
                    placeholder='Search friends, posts...'
                  />
                </div>
              </div>
            </div>

            {/* --- Middle: Navigation Icons --- */}
            <div className='hidden md:flex items-center justify-center flex-1 max-w-xl mx-4'>
              <div className='flex items-center space-x-2 w-full justify-between'>
                <NavItem icon={Home} href='/' active />
                <NavItem icon={Users} href='/friends' />
                <NavItem icon={Tv} href='/watch' />
                <NavItem icon={PlusSquare} href='/create' />
              </div>
            </div>

            {/* --- Right Side: Actions & Profile --- */}
            <div className='flex items-center justify-end gap-2 sm:gap-4 min-w-[200px]'>
              <div className='flex items-center gap-2'>
                <IconButton icon={MessageCircle} count={3} />
                <IconButton icon={Bell} count={12} />
              </div>

              {/* Profile Dropdown */}
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className='flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700'
                >
                  <img
                    src='https://picsum.photos/200?random=41'
                    alt='User'
                    className='w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-black'
                  />
                  <div className='hidden lg:block text-left px-1'>
                    <p className='text-xs font-semibold text-gray-700 dark:text-gray-200'>
                      Safayet H.
                    </p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className='absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2'>
                    {/* User Info Card inside Dropdown */}
                    <div className='p-3 mb-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3'>
                      <img
                        src='https://picsum.photos/200?random=41'
                        alt='User'
                        className='w-10 h-10 rounded-full object-cover'
                      />
                      <div>
                        <p className='font-semibold text-sm text-gray-900 dark:text-white'>
                          Safayet Hossain
                        </p>
                        <p className='text-xs text-gray-500'>
                          View your profile
                        </p>
                      </div>
                    </div>

                    <div className='space-y-1'>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors'
                        >
                          <item.icon className='w-4 h-4 text-gray-500' />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button className='md:hidden p-2 text-gray-600 dark:text-gray-300'>
                <Menu className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
