export enum GenderEnum {
  male = "male",
  female = "female",
  other = "other",
}

export interface IFormInput {
  name: string;
  gender: GenderEnum;
  email: string;
  password: string;
}
