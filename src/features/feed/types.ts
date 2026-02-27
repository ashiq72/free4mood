export interface Post {
  _id?: string;
  text: string;
  user?: { _id?: string; name?: string; profileImage?: string } | string;
  image?: string;
  likes?: number | string[];
  comments?:
    | number
    | {
        _id?: string;
        user?: { _id?: string; name?: string } | string;
        text?: string;
        createdAt?: string;
      }[];
  createdAt?: string;
}
