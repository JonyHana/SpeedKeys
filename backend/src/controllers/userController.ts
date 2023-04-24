import { User } from "@prisma/client";
import { RegisterGetReqBodySchema } from "../typings/types";
import { prisma } from "../utils/db";
import { generateSalt, hashPassword } from "../utils/hashPassword";

type T_UserRegistration = {
  registerError: string | null;
  user: User | null;
};

export async function registerUser(username: string, password: string): Promise<T_UserRegistration> {
  const dataCheck = RegisterGetReqBodySchema.safeParse({ username, password });
  
  if (!dataCheck.success) {
    //console.log('Zod validation error -> ', dataCheck, dataCheck.error);
    return {
      registerError: dataCheck.error.errors[0].message,
      user: null
    };
  }

  let user = await prisma.user.findUnique({
    where: { username }
  });

  if (user) {
    return {
      registerError: 'That username is already taken.',
      user: null
    };
  }

  const salt = generateSalt(16);
  const hashedPassword = hashPassword(password, salt);

  user = await prisma.user.create({
    data: { username, password: hashedPassword, password_salt: salt }
  });

  return {
    user,
    registerError: null,
  }
}
