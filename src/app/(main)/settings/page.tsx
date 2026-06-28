"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyholeIcon,
  LogOutIcon,
  RefreshCwIcon,
  ShieldIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  changePassword,
  logout,
  type ChangePasswordPayload,
} from "@/lib/api/auth.client";
import {
  getMyBlockedUsers,
  toggleBlockUser,
  type FollowUser,
} from "@/lib/api/social";
import { getMe, updateUser } from "@/lib/api/user";
import type { IUserInfo } from "@/features/profile/types";
import { useUser } from "@/shared/context/UserContext";
import { RemoteImage } from "@/shared/components/RemoteImage";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type SettingsSection = "profile" | "privacy" | "security";

type ProfileForm = {
  name: string;
  bio: string;
  about: string;
  location: string;
  website: string;
  dateOfBirth: string;
};

const emptyProfile: ProfileForm = {
  name: "",
  bio: "",
  about: "",
  location: "",
  website: "",
  dateOfBirth: "",
};

const emptyPassword: ChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function SettingsPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [section, setSection] = useState<SettingsSection>("profile");
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [password, setPassword] =
    useState<ChangePasswordPayload>(emptyPassword);
  const [blockedUsers, setBlockedUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getMe<IUserInfo>();
      const info = response.data;
      setUserInfo(info);
      setProfile({
        name: info?.name || "",
        bio: info?.bio || "",
        about: info?.about || "",
        location: info?.location || "",
        website: info?.website || "",
        dateOfBirth: info?.dateOfBirth?.slice(0, 10) || "",
      });
    } catch (error: unknown) {
      setLoadError(messageFromError(error, "Failed to load account settings"));
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    setBlockedLoading(true);
    try {
      const response = await getMyBlockedUsers({ limit: 50 });
      setBlockedUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      toast.error(messageFromError(error, "Failed to load blocked users"));
    } finally {
      setBlockedLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
    void loadBlockedUsers();
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setProfileSaving(true);
    try {
      await updateUser({
        name: profile.name.trim(),
        bio: profile.bio.trim(),
        about: profile.about.trim(),
        location: profile.location.trim(),
        website: profile.website.trim(),
        dateOfBirth: profile.dateOfBirth,
      });
      const refreshed = await getMe<IUserInfo>();
      setUserInfo(refreshed.data);
      setUser((current) =>
        current
          ? {
              ...current,
              name: refreshed.data?.name || current.name,
              image: refreshed.data?.image || current.image,
            }
          : current,
      );
      toast.success("Profile settings saved");
    } catch (error: unknown) {
      toast.error(messageFromError(error, "Failed to save profile"));
    } finally {
      setProfileSaving(false);
    }
  };

  const unblockUser = async (userId: string) => {
    setUnblockingId(userId);
    try {
      const response = await toggleBlockUser(userId);
      if (!response.data?.isBlocked) {
        setBlockedUsers((users) => users.filter((user) => user._id !== userId));
      }
      toast.success("User unblocked");
    } catch (error: unknown) {
      toast.error(messageFromError(error, "Failed to unblock user"));
    } finally {
      setUnblockingId(null);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (
      password.newPassword.length < 8 ||
      !/[A-Za-z]/.test(password.newPassword) ||
      !/[0-9]/.test(password.newPassword)
    ) {
      toast.error("Use at least 8 characters with a letter and a number");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(password);
      logout();
      setUser(null);
      toast.success("Password changed. Sign in again.");
      router.replace("/login");
      router.refresh();
    } catch (error: unknown) {
      toast.error(messageFromError(error, "Failed to change password"));
    } finally {
      setPasswordSaving(false);
    }
  };

  const signOut = () => {
    logout();
    setUser(null);
    router.replace("/login");
    router.refresh();
  };

  const sections: Array<{
    id: SettingsSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "profile", label: "Profile", icon: UserRoundIcon },
    { id: "privacy", label: "Privacy", icon: ShieldIcon },
    { id: "security", label: "Security", icon: LockKeyholeIcon },
  ];

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 dark:bg-black sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your profile, privacy, and account security.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
          <nav
            className="flex gap-2 overflow-x-auto md:flex-col"
            aria-label="Settings sections"
          >
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  section === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-zinc-900"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {loadError && (
              <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <span>{loadError}</span>
                <Button variant="outline" size="sm" onClick={loadSettings}>
                  Try again
                </Button>
              </div>
            )}

            {section === "profile" && (
              <form onSubmit={saveProfile}>
                <SettingsHeader
                  title="Profile information"
                  description="Update the details shown on your profile."
                />
                <div className="grid gap-4 p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                    <Field label="Name">
                      <Input
                        value={profile.name}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        maxLength={120}
                        disabled={loading}
                        required
                      />
                    </Field>
                    <Field label="Email">
                      <Input value={userInfo?.email || ""} disabled />
                    </Field>
                  </div>
                  <Field label="Bio">
                    <Input
                      value={profile.bio}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
                      maxLength={500}
                      disabled={loading}
                    />
                  </Field>
                  <Field label="About">
                    <Textarea
                      value={profile.about}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          about: event.target.value,
                        }))
                      }
                      maxLength={1000}
                      rows={4}
                      disabled={loading}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Location">
                      <Input
                        value={profile.location}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            location: event.target.value,
                          }))
                        }
                        maxLength={200}
                        disabled={loading}
                      />
                    </Field>
                    <Field label="Website">
                      <Input
                        value={profile.website}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            website: event.target.value,
                          }))
                        }
                        maxLength={500}
                        placeholder="https://example.com"
                        disabled={loading}
                      />
                    </Field>
                  </div>
                  <Field label="Date of birth">
                    <Input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          dateOfBirth: event.target.value,
                        }))
                      }
                      className="max-w-xs"
                      disabled={loading}
                    />
                  </Field>
                </div>
                <SettingsFooter>
                  <Button type="submit" disabled={loading || profileSaving}>
                    {profileSaving ? "Saving..." : "Save changes"}
                  </Button>
                </SettingsFooter>
              </form>
            )}

            {section === "privacy" && (
              <>
                <SettingsHeader
                  title="Blocked users"
                  description="Blocked users cannot interact with your social content."
                  action={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={loadBlockedUsers}
                      disabled={blockedLoading}
                      aria-label="Refresh blocked users"
                      title="Refresh blocked users"
                    >
                      <RefreshCwIcon
                        className={blockedLoading ? "animate-spin" : ""}
                      />
                    </Button>
                  }
                />
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {blockedLoading && blockedUsers.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                      Loading blocked users...
                    </p>
                  ) : blockedUsers.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                      You have not blocked anyone.
                    </p>
                  ) : (
                    blockedUsers.map((blockedUser) => (
                      <div
                        key={blockedUser._id}
                        className="flex items-center gap-3 px-5 py-4"
                      >
                        <RemoteImage
                          src={blockedUser.image || "/default-avatar.svg"}
                          alt=""
                          width={44}
                          height={44}
                          className="size-11 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {blockedUser.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {blockedUser.bio || "Blocked user"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void unblockUser(blockedUser._id)}
                          disabled={unblockingId === blockedUser._id}
                        >
                          {unblockingId === blockedUser._id
                            ? "Updating..."
                            : "Unblock"}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {section === "security" && (
              <>
                <form onSubmit={savePassword}>
                  <SettingsHeader
                    title="Change password"
                    description="Changing your password signs out existing sessions."
                  />
                  <div className="grid max-w-xl gap-4 p-5">
                    <Field label="Current password">
                      <Input
                        type="password"
                        autoComplete="current-password"
                        value={password.currentPassword}
                        onChange={(event) =>
                          setPassword((current) => ({
                            ...current,
                            currentPassword: event.target.value,
                          }))
                        }
                        minLength={6}
                        required
                      />
                    </Field>
                    <Field label="New password">
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={password.newPassword}
                        onChange={(event) =>
                          setPassword((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        minLength={8}
                        required
                      />
                    </Field>
                    <Field label="Confirm new password">
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={password.confirmPassword}
                        onChange={(event) =>
                          setPassword((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        minLength={8}
                        required
                      />
                    </Field>
                  </div>
                  <SettingsFooter>
                    <Button type="submit" disabled={passwordSaving}>
                      {passwordSaving ? "Changing..." : "Change password"}
                    </Button>
                  </SettingsFooter>
                </form>

                <div className="border-t border-gray-200 dark:border-zinc-800">
                  <SettingsHeader
                    title="Current session"
                    description="Sign out this browser from your Free4Mood account."
                  />
                  <div className="p-5">
                    <Button variant="outline" onClick={signOut}>
                      <LogOutIcon />
                      Sign out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="grid gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
    <span>{label}</span>
    {children}
  </label>
);

const SettingsHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
    <div>
      <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{description}</p>
    </div>
    {action}
  </div>
);

const SettingsFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
    {children}
  </div>
);
