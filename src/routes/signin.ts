import express, { Request, Response } from 'express';
import { body } from 'express-validator';
//import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user';
import { PasswordManager } from '../services/password';
import { TwoFAManager } from '../services/2FA';
import nodemailer from 'nodemailer';
import mailgunTransport from 'nodemailer-mailgun-transport';

//import {  } from '../controllers/auth.controller'

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid email'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('user does not exist');
    }

    const passwordsMatch = await PasswordManager.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError('invalid password.');
    }

    // const userJwt = jwt.sign(
    //   {
    //     id: existingUser.id,
    //     email: existingUser.email,
    //   },
    //   process.env.TICKETING_KEY!
    // );

    // //Store it on the session object.

    // req.session = {
    //   jwt: userJwt,
    // };

    // res.status(200).send(existingUser);

    const twoFactorCode = await TwoFAManager.genRandomNum();
    const twoFactorTimeout = await TwoFAManager.setTimeout();
    console.log(twoFactorTimeout);
    existingUser.twoFACode = twoFactorCode;
    existingUser.twoFATimeout = twoFactorTimeout;

    existingUser.save();

    //send email to user for 2FA authentication

    const mailAuth = {
      auth: {
        api_key: process.env.EMAIL_KEY!,
        domain: 'sandbox8d10f27ca1ca4a3fbbe1f4159d9bae02.mailgun.org',
      },
    };

    let transporter = nodemailer.createTransport(mailgunTransport(mailAuth));
    let sendMail = transporter.sendMail.bind(transporter);

    await TwoFAManager.send2FAEmail(twoFactorCode, sendMail);

    res.status(200).send({ code: twoFactorCode });
  }
);

export { router as signinRouter };
