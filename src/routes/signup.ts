import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { errorNet } from '../utils/error-handler.utils';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    const twoFACode = null;
    const twoFATimeout = null;

    if (existingUser) {
      throw new BadRequestError('email in use.');
    }

    const user = User.build({
      email,
      password,
      phone,
      twoFACode,
      twoFATimeout,
    });
    await user.save();

    // generate JWT

    //because it is entirely possible for the environment variable used below to not be defined
    //when the application is ran, Typescript will not allow you to use the environment
    //variable without first accounting for the oversight.

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.TICKETING_KEY!
    );

    //Store it on the session object.

    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
