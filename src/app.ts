import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
const app = express();

import { currentUserRouter } from './routes/current-user';
import { errorHandler } from './middlewares/error-handler';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { twoFactorRouter } from './routes/twofactor-auth';
import { NotFoundError } from './errors/not-found-error';

app.set('trust proxy', true);
// because traffic is being proxied into express through ingress nginx
// express does not trust requests being proxied into it by default.
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    // this disables encryption on the cookie, the jwt itself is already encrypted.
    // question: is it because it takes extra bandwidth to encrypt a cookie?
    secure: process.env.NODE_ENV !== 'test',
    // this says that we are only accepting requests that are made with the https protocol only.
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(twoFactorRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
