"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { getMessageStreamUrl, getUnreadMessageCount } from "@/lib/api/message";
import { getMe } from "@/lib/api/user";
import type { IUserInfo } from "@/features/profile/types";
import { useUser } from "@/shared/context/UserContext";
import { RemoteImage } from "@/shared/components/RemoteImage";

const NavItem = ({
  icon: Icon,
  active,
  href,
  label,
}: {
  icon: ElementType;
  active?: boolean;
  href: string;
  label: string;
}) => (
  <Link
    href={href}
    className={`relative flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
      active
        ? "bg-[var(--mood-ink)] text-white dark:bg-white dark:text-black"
        : "text-[var(--mood-muted)] hover:bg-[var(--mood-surface-soft)] hover:text-[var(--mood-ink)]"
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
    {active && (
      <span className="absolute -bottom-[13px] left-1/2 h-1 w-7 -translate-x-1/2 bg-[var(--mood-coral)]" />
    )}
  </Link>
);

const MobileNavItem = ({
  icon: Icon,
  active,
  href,
  label,
}: {
  icon: ElementType;
  active?: boolean;
  href: string;
  label: string;
}) => (
  <Link
    href={href}
    className={`flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-bold ${
      active ? "text-[var(--mood-coral)]" : "text-[var(--mood-muted)]"
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
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
      className={`relative flex h-10 w-10 items-center justify-center rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] text-[var(--mood-ink)] transition-colors hover:border-[var(--mood-ink)] cursor-pointer ${className}`}
    >
      <Icon className="w-5 h-5" />
      {count ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--mood-coral)] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--mood-surface)]">
          {count}
        </span>
      ) : null}
    </button>
  );
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const currentUserId = user?.userId;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [profileImage, setProfileImage] = useState("/default-avatar.svg");
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
    setUser(null);
    setIsUserMenuOpen(false);
    router.replace("/login");
    router.refresh();
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
    if (!currentUserId) {
      setProfileImage("/default-avatar.svg");
      return;
    }

    let active = true;
    const loadProfile = async () => {
      try {
        const res = await getMe<IUserInfo>();
        if (!active) return;
        setProfileImage(res.data?.image || "/default-avatar.svg");
        setUser((current) => {
          if (!current || !res.data) return current;
          const nextName = res.data.name || current.name;
          const nextImage = res.data.image || current.image;
          if (nextName === current.name && nextImage === current.image) {
            return current;
          }
          return {
            ...current,
            name: nextName,
            image: nextImage,
          };
        });
      } catch {
        if (!active) return;
        setProfileImage("/default-avatar.svg");
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [currentUserId, setUser]);

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
    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    let active = true;
    let fallbackTimer: number | null = null;
    let stream: EventSource | null = null;

    const loadUnreadMessages = async () => {
      try {
        const res = await getUnreadMessageCount();
        if (!active) return;
        setUnreadMessageCount(Number(res.data?.unreadCount || 0));
      } catch {
        if (!active) return;
      }
    };

    void loadUnreadMessages();

    try {
      const url = getMessageStreamUrl();
      stream = new EventSource(url);

      stream.addEventListener("unread_count", (event) => {
        if (!active) return;
        try {
          const data = JSON.parse((event as MessageEvent).data || "{}");
          setUnreadMessageCount(Number(data?.unreadCount || 0));
        } catch {
          // ignore parse errors
        }
      });

      stream.onerror = () => {
        if (!active) return;
        if (fallbackTimer === null) {
          fallbackTimer = window.setInterval(() => {
            void loadUnreadMessages();
          }, 15000);
        }
      };
    } catch {
      fallbackTimer = window.setInterval(() => {
        void loadUnreadMessages();
      }, 15000);
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
      <nav className="border-b border-[var(--mood-line)] bg-[color:var(--mood-surface)]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1540px] px-3 sm:px-6">
          <div className="flex h-[68px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-5">
              <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-[var(--mood-ink)] text-lg font-black text-white dark:bg-white dark:text-black">
                  F
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--mood-surface)] bg-[var(--mood-coral)]" />
                </div>
                <span className="hidden text-lg font-bold text-[var(--mood-ink)] sm:block">
                  Free4Mood
                </span>
              </Link>

              <div className="hidden md:flex items-center" ref={searchRef}>
                <div className="group relative w-64 xl:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="block h-10 w-full rounded-md border border-transparent bg-[var(--mood-surface-soft)] pl-10 pr-3 text-sm text-[var(--mood-ink)] outline-none transition placeholder:text-[var(--mood-muted)] focus:border-[var(--mood-jade)] focus:bg-[var(--mood-surface)]"
                    placeholder="Search the pulse"
                  />

                  {searchOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 max-h-96 overflow-auto rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-2 shadow-xl">
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
                                    if (item._id) {
                                      router.push(`/profile/${item._id}`);
                                    }
                                  }}
                                  className="w-full rounded-md px-3 py-2 text-left hover:bg-[var(--mood-surface-soft)]"
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
                                  className="w-full rounded-md px-3 py-2 text-left hover:bg-[var(--mood-surface-soft)]"
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

            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-1">
                <NavItem
                  icon={Home}
                  href="/"
                  active={pathname === "/"}
                  label="Pulse"
                />
                <NavItem
                  icon={Users}
                  href="/friends"
                  active={pathname.startsWith("/friends")}
                  label="Circles"
                />
                <NavItem
                  icon={Tv}
                  href="/watch"
                  active={pathname.startsWith("/watch")}
                  label="Watch"
                />
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="cursor-pointer">
                  <IconButton
                    icon={MessageCircle}
                    count={unreadMessageCount}
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
                    className="flex h-10 items-center gap-2 rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-1 pr-2 transition-colors hover:border-[var(--mood-ink)] cursor-pointer"
                  >
                    <RemoteImage
                      alt=""
                      src={profileImage}
                      className="h-8 w-8 shrink-0 rounded object-cover"
                      onError={() => setProfileImage("/default-avatar.svg")}
                    />
                    <span className="hidden lg:block text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize">
                      {user?.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] p-2 shadow-xl">
                      <div className="mb-2 flex items-center gap-3 rounded-md bg-[var(--mood-surface-soft)] p-3">
                        <RemoteImage
                          alt=""
                          src={profileImage}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                          onError={() => setProfileImage("/default-avatar.svg")}
                        />
                        <div>
                          <p className="capitalize font-semibold text-sm text-gray-900 dark:text-white">
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
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--mood-ink)] transition hover:bg-[var(--mood-surface-soft)] cursor-pointer"
                            >
                              <item.icon className="w-4 h-4 text-gray-500" />
                              {item.name} 
                            </button>
                          ) : (
                            <Link
                              key={item.name}
                              href={item.href!}
                              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--mood-ink)] transition hover:bg-[var(--mood-surface-soft)]"
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
                className="inline-flex h-10 items-center rounded-md bg-[var(--mood-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--mood-coral)] dark:bg-white dark:text-black cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      {user && (
        <nav
          aria-label="Mobile social navigation"
          className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[var(--mood-line)] bg-[color:var(--mood-surface)]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
          <MobileNavItem
            icon={Home}
            href="/"
            label="Pulse"
            active={pathname === "/"}
          />
          <MobileNavItem
            icon={Users}
            href="/friends"
            label="Circles"
            active={pathname.startsWith("/friends")}
          />
          <MobileNavItem
            icon={Tv}
            href="/watch"
            label="Watch"
            active={pathname.startsWith("/watch")}
          />
          <MobileNavItem
            icon={User}
            href="/profile"
            label="Profile"
            active={pathname.startsWith("/profile")}
          />
        </nav>
      )}
    </div>
  );
}
