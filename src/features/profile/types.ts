export interface IUserInfo {
  _id?: string;
  name?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  about?: string;
  bio?: string;
  location?: string;
  image?: string;
  coverImage?: string;
  website?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export type ProfileTabKey = "posts" | "about" | "friends" | "photos" | "videos";
