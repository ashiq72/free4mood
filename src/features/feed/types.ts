export interface Post {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  likes?: number | unknown[];
  comments?: number | unknown[];
  createdAt?: string;
}
