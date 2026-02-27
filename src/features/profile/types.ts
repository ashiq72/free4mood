export interface IUserInfo {
  _id?: string;
  name?: string;
  about?: string;
  bio?: string;
  location?: string;
  image?: string;
  website?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export type ProfileTabKey = "posts" | "about" | "friends" | "photos" | "videos";
