export interface IUser {
  userId: string;
  isActive?: boolean;
  name: string;
  gender: string;
  phone: string;
  iat?: number;
  exp?: number;
}
