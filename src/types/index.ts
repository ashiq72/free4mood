export interface IUser {
  userId: string;
  isActive?: boolean;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  iat?: number;
  exp?: number;
}
