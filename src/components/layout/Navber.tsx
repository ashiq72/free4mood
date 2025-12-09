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
  LogOut,
  Settings,
  User,
  PlusSquare,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { logout } from "@/lib/api/auth/auth";

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
    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative ${
      active
        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
    }`}
  >
    <Icon className={`w-6 h-6 ${active ? "fill-current" : "stroke-current"}`} />
    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1"></span>
  </Link>
);

type IconButtonProps = {
  icon: React.ElementType;
  count?: number;
  onClick?: () => void;
  className?: string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  count,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 
        text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 
        transition-colors cursor-pointer ${className}`}
    >
      <Icon className="w-5 h-5" />
      {count ? (
        <span
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center
          rounded-full bg-red-500 text-[10px] font-bold text-white border-2 
          border-white dark:border-black"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
};

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const handleLogout = async () => {
    await logout();

    // Reload page so user state becomes null everywhere
    window.location.reload();
    setIsUserMenuOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
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
    { name: "Sign Out", action: handleLogout, icon: LogOut },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="bg-white/90 dark:bg-black/90 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  F
                </div>
                <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Free4Mood
                </span>
              </Link>

              <div className="hidden md:flex items-center">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="block w-64 pl-10 pr-3 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-black transition-all text-sm"
                    placeholder="Search friends, posts..."
                  />
                </div>
              </div>
            </div>

            {/* Middle */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-4">
              <div className="flex items-center space-x-2 w-full justify-between">
                <NavItem icon={Home} href="/" active />
                <NavItem icon={Users} href="/friends" />
                <NavItem icon={Tv} href="/watch" />
                <NavItem icon={PlusSquare} href="/create" />
              </div>
            </div>

            {/* Right */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4  ">
                <div className="cursor-pointer">
                  <IconButton icon={MessageCircle} count={3} />
                </div>
                <div className="cursor-pointer">
                  <IconButton icon={Bell} count={12} />
                </div>
                {/* Profile OR Login */}

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <img
                      src="https://picsum.photos/200?random=41"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-black"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2">
                      {/* User Card */}
                      <div className="p-3 mb-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                        <img
                          src="https://picsum.photos/200?random=41"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            View your profile
                          </p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        {userMenuItems.map((item) =>
                          item.action ? (
                            <button
                              key={item.name}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                            >
                              <item.icon className="w-4 h-4 text-gray-500 " />
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              key={item.name}
                              href={item.href!}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition"
                            >
                              <item.icon className="w-4 h-4 text-gray-500" />
                              {item.name}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
