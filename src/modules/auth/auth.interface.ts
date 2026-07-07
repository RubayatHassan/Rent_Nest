import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  address?: string;
  profilePhoto?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}
