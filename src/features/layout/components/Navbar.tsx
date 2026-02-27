"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ElementType } from "react";
import {
  Bell,
  Home,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Tv,
  User,
  Users,
} from "lucide-react";
import { logout } from "@/lib/api/auth.client";
import {
  getNotificationStreamUrl,
  getUnreadNotificationCount,
  searchSocial,
  type SocialSearchResult,
} from "@/lib/api/social";
import { useUser } from "@/shared/context/UserContext";

const NavItem = ({
  icon: Icon,
  active,
  href,
}: {
  icon: ElementType;
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
    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1" />
  </Link>
);

type IconButtonProps = {
  icon: ElementType;
  count?: number;
  onClick?: () => void;
  className?: string;
};

export const IconButton = ({
  icon: Icon,
  count,
  onClick,
  className = "",
}: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer ${className}`}
    >
      <Icon className="w-5 h-5" />
      {count ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-black">
          {count}
        </span>
      ) : null}
    </button>
  );
};

export default function Navbar() {
  const router = useRouter();
  const { user } = useUser();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<SocialSearchResult>({
    users: [],
    posts: [],
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let active = true;
    let fallbackTimer: number | null = null;
    let stream: EventSource | null = null;

    const loadUnread = async () => {
      try {
        const res = await getUnreadNotificationCount();
        if (!active) return;
        setUnreadCount(Number(res.data?.unreadCount || 0));
      } catch {
        if (!active) return;
      }
    };

    void loadUnread();

    try {
      const url = getNotificationStreamUrl();
      stream = new EventSource(url);

      stream.addEventListener("unread_count", (event) => {
        if (!active) return;
        try {
          const data = JSON.parse((event as MessageEvent).data || "{}");
          setUnreadCount(Number(data?.unreadCount || 0));
        } catch {
          // ignore parse errors
        }
      });

      stream.onerror = () => {
        if (!active) return;
        if (fallbackTimer === null) {
          fallbackTimer = window.setInterval(() => {
            void loadUnread();
          }, 30000);
        }
      };
    } catch {
      fallbackTimer = window.setInterval(() => {
        void loadUnread();
      }, 30000);
    }

    return () => {
      active = false;
      if (fallbackTimer !== null) {
        window.clearInterval(fallbackTimer);
      }
      if (stream) {
        stream.close();
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = searchText.trim();

    if (q.length < 2) {
      setSearchData({ users: [], posts: [] });
      setSearchOpen(false);
      return;
    }

    let active = true;
    setSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await searchSocial(q, { limitUsers: 6, limitPosts: 5 });
        if (!active) return;
        setSearchData(res.data || { users: [], posts: [] });
        setSearchOpen(true);
      } catch {
        if (!active) return;
        setSearchData({ users: [], posts: [] });
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchText, user]);

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
            <div className="flex items-center gap-4 lg:gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  F
                </div>
                <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Free4Mood
                </span>
              </Link>

              <div className="hidden md:flex items-center" ref={searchRef}>
                <div className="relative group w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-black transition-all text-sm"
                    placeholder="Search friends, posts..."
                  />

                  {searchOpen && (
                    <div className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-2 z-30 max-h-96 overflow-auto">
                      {searchLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                      ) : (
                        <>
                          {searchData.users.length === 0 && searchData.posts.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                          )}

                          {searchData.users.length > 0 && (
                            <div className="mb-2">
                              <p className="px-3 py-1 text-xs uppercase tracking-wide text-gray-500">
                                Users
                              </p>
                              {searchData.users.map((item) => (
                                <button
                                  type="button"
                                  key={item._id}
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchText("");
                                    router.push(
                                      `/friends?search=${encodeURIComponent(
                                        item.name || "",
                                      )}`,
                                    );
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
                                >
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                  <p className="text-xs text-gray-500 line-clamp-1">{item.bio || "User profile"}</p>
                                </button>
                              ))}
                            </div>
                          )}

                          {searchData.posts.length > 0 && (
                            <div>
                              <p className="px-3 py-1 text-xs uppercase tracking-wide text-gray-500">
                                Posts
                              </p>
                              {searchData.posts.map((item) => (
                                <button
                                  type="button"
                                  key={item._id}
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchText("");
                                    if (item._id) router.push(`/post/${item._id}`);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
                                >
                                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{item.text || "Post"}</p>
                                  <p className="text-xs text-gray-500">{item.user?.name || "Unknown"}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-4">
              <div className="flex items-center space-x-2 w-full justify-between">
                <NavItem icon={Home} href="/" active />
                <NavItem icon={Users} href="/friends" />
                <NavItem icon={Tv} href="/watch" />
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="cursor-pointer">
                  <IconButton
                    icon={MessageCircle}
                    count={0}
                    onClick={() => router.push("/messages")}
                  />
                </div>
                <div className="cursor-pointer">
                  <IconButton
                    icon={Bell}
                    count={unreadCount}
                    onClick={() => router.push("/notifications")}
                  />
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Image
                      alt=""
                      width={36}
                      height={36}
                      src="https://picsum.photos/200?random=41"
                      className="rounded-full object-cover ring-2 ring-white dark:ring-black"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {user?.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2">
                      <div className="p-3 mb-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                        <Image
                          alt=""
                          width={40}
                          height={40}
                          src="https://picsum.photos/200?random=41"
                          className="rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500">View your profile</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {userMenuItems.map((item) =>
                          item.action ? (
                            <button
                              key={item.name}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                            >
                              <item.icon className="w-4 h-4 text-gray-500" />
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
                          ),
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
