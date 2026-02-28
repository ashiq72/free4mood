export interface Post {
  _id?: string;
  text: string;
  user?: { _id?: string; name?: string; profileImage?: string; image?: string } | string;
  image?: string;
  likes?: number | string[];
  comments?:
    | number
    | {
        _id?: string;
        id?: string;
        user?: { _id?: string; name?: string } | string;
        text?: string;
        createdAt?: string;
        updatedAt?: string;
      }[];
  createdAt?: string;
}
