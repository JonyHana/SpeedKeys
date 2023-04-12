import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { prisma } from '../utils/db';
import { hashPassword, generateSalt } from '../utils/hashPassword';
import { Prisma } from '@prisma/client';

const router = express.Router();

type T_RegisterBody = {
  username: string;
  password: string;
}

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized, not logged in.' });
}

router.post('/login',
  passport.authenticate(
    'local', {
      failureRedirect: '/login',
      failureMessage: true
    }
  ),
  (req: Request, res: Response) => {
    //res.json({ msg: "Successfully logged in" });
    res.redirect('/');
  }
);

router.post('/logout', isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    //res.redirect('/');
    res.json([]);
  });
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  const { username, password }: T_RegisterBody = req.body;

  console.log('register req.body -> ', req.body);

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

  req.login(user, function(err) {
    if (err) return next(err);

    req.session.auth = {
      username: (user as Prisma.UserCreateInput).username
    }

    return res.json({ msg: 'logged in' });
  });
});

export default router;
