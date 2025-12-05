"use client";

import { IUser } from "@/types";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
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
  initialUser: IUser | null;
}

const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

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
