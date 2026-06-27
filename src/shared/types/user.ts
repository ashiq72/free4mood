export interface IUser {
  userId: string;
  _id?: string;
  isActive?: boolean;
  name: string;
  gender: string;
  phone: string;
  email?: string;
  tenantId?: string;
  role?: "user" | "admin" | "super_admin";
  image?: string;
  profileImage?: string;
  coverImage?: string;
  iat?: number;
  exp?: number;
}
