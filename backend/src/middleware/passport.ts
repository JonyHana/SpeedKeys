import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';

import { prisma } from '../utils/db';
import { verifiedPassword } from '../utils/hashPassword';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Note: This must be in this order! See https://stackoverflow.com/questions/29111571/passports-req-isauthenticated-always-returning-false-even-when-i-hardcode-done
// Initialize passport authentication.
router.use(passport.initialize());
// To persist login sessions.
router.use(passport.session());

passport.serializeUser(function(user: Prisma.UserWhereInput, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.deserializeUser(function(user: Prisma.UserWhereInput, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new Strategy(
  async function verify(username, password, done) {
    const user = await prisma.user
      .findUnique({ where: { username } })
      .catch((err) => {
        console.warn('Strategy verify error -> ', err);
        //return done(err);
      });
    
    if (!user) {
      console.log('Could not find user.');
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    
    console.log('check verify ->', username, password, '?', user.username, user.password, user.password_salt);

    if (verifiedPassword(password, user)) {
      console.log('User is verified.');
      return done(null, user);
    }
    else {
      console.log('User is not verified. Invalid password.');
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));

export default router;
