import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { prisma } from '../utils/db';
import { hashPassword, generateSalt } from '../utils/hashPassword';
import { createUserSessionObject } from '../utils/userSessionObject';

const router = express.Router();

type T_RegisterGetReqBody = {
  username: string;
  password: string;
}

type T_BenchmarkPostReqBody = {
  username: string;
}

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

  //console.log('register req.body -> ', req.body);

  let user = await prisma.user.findUnique({
    where: { username }
  });

  const salt = generateSalt(16);
  const hashedPassword = hashPassword(password, salt);

  if (!hashedPassword) {
    console.log('Error attempting to create user ->', username, salt, hashedPassword);
    return res.json({ error: 'An error occured, could not create user profile.' });
  }

  if (user) {
    return res.json({ error: "That username already exists." });
  }

  user = await prisma.user.create({
    data: { username, password: hashedPassword, password_salt: salt }
  });
  
  //console.log('created user ->', user);
  
  // This will create (req.user) the user field in the request body.
  //  But it's best to use req.session instead since req.user doesn't seem to work with the WebSocket server.
  req.login(createUserSessionObject(user), function(err) {
    if (err) return next(err);
    return res.json({ msg: 'logged in' });
  });
});

router.get('/benchmarks', async (req: Request, res: Response) => {
  const { username } = req.params;

  /*const user = await prisma.user.findUnique({
    where: { id: userId }
  });*/

  const benchmarks = await prisma.benchmark.findMany({
    where: { User: { username } },
    select: {
      completed: true, 
      elapsedTime: true
    }
  });

  console.log(benchmarks);

  if (!benchmarks) {
    return res.json({ msg: 'User has no benchmarks.' });
  }

  res.json(benchmarks);
});

export default router;
