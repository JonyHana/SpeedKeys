import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { prisma } from '../utils/db';
import { hashPassword, generateSalt } from '../utils/hashPassword';
import { createUserSessionObject } from '../utils/userSessionObject';

import { RegisterGetReqBodySchema, T_RegisterGetReqBody } from '../typings/types';

const router = express.Router();

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized, not logged in.' });
}

router.post('/login',
  passport.authenticate(
    'local', {
      //failureRedirect: '/login',
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
    res.redirect('/');
  });
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  const { username, password }: T_RegisterGetReqBody = req.body;

  const dataCheck = RegisterGetReqBodySchema.safeParse({ username, password });
  //console.log(dataCheck, { username, password });
  if (!dataCheck.success) {
    console.log('Zod validation error -> ', dataCheck, dataCheck.error);
    return res.json({ registerError: dataCheck.error.errors[0].message });
  }

  //console.log('register req.body -> ', req.body);

  let user = await prisma.user.findUnique({
    where: { username }
  });

  if (user) {
    return res.json({ registerError: 'That username is already taken.' });
  }

  const salt = generateSalt(16);
  const hashedPassword = hashPassword(password, salt);

  user = await prisma.user.create({
    data: { username, password: hashedPassword, password_salt: salt }
  });
  
  //console.log('created user ->', user);
  
  // This will create (req.user) the user field in the request body.
  //  But it's best to use req.session instead since req.user doesn't seem to work with the WebSocket server.
  req.login(createUserSessionObject(user), function(err) {
    if (err) return next(err);
    return res.json({ loggedIn: true });
  });
});

export default router;
