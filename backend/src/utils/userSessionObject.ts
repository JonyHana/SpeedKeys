import { User } from "@prisma/client";

type T_UserSession = {
  username: string;
};

// This is a object template gets passed on req.login or in the passport middleware verify function.
export function createUserSessionObject(user: User): T_UserSession {
  return { username: user.username }
}