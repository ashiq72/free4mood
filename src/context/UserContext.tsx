"use client";

import { getCurrentUser } from "@/lib/api/auth/auth";
import { IUser } from "@/types";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface IUserProviderValues {
  user: IUser | null;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;

    (async () => {
      const currentUser = await getCurrentUser();
      if (mounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};

export default UserProvider;
