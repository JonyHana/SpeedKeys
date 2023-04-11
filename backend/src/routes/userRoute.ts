import express, { Request, Response } from 'express';
import passport from 'passport';

import { prisma } from '../utils/db';
import { hashPassword, generateSalt } from '../utils/hashPassword';

const router = express.Router();

type T_RegisterBody = {
  username: string;
  password: string;
}

router.post('/login',
  passport.authenticate(
    'local', {
      failureRedirect: '/login',
      failureMessage: true
    }
  ),
  (req: Request, res: Response) => {
    res.json({ msg: "Successfully logged in" });
  }
);

router.post('/register', async (req: Request, res: Response) => {
  const { username, password }: T_RegisterBody = req.body;

  let user = await prisma.user.findUnique({
    where: { username }
  });

  const salt = generateSalt(16);
  const hashedPassword = hashPassword(password, salt);

  if (!hashedPassword) {
    console.log('error attempting to create user ->', username, salt, hashedPassword);
    return res.json({ error: "An error occured, couldn't create user profile." });
  }

  if (user) {
    return res.json({ error: "That username already exists." });
  }

  user = await prisma.user.create({
    data: { username, password: hashedPassword, password_salt: salt }
  });
  
  console.log('created user ->', user);

  res.json({ user });
});

export default router;
