export interface Post {
  _id?: string;
  text: string;
  user?: { name?: string } | string;
  image?: string;
  likes?: number | unknown[];
  comments?: number | unknown[];
  createdAt?: string;
}
