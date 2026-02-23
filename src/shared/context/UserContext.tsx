"use client";

import type { IUser } from "@/shared/types/user";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface IUserProviderValues {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

export default function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: IUser | null;
}) {
  const [user, setUser] = useState<IUser | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
