import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import { TwoFactorTimeoutError } from '../errors/two-factor-timeout-error';
import { User } from '../models/user';
import { TwoFAManager } from '../services/2FA';
import { BadRequestError } from '../errors/bad-request-error';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/twofactorauth',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('code')
      .trim()
      .isLength({ min: 4, max: 4 })
      .withMessage('code is only 4 digits long'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, code, now } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('user does not exist');
    }

    if (user.twoFATimeout !== null && now > user.twoFATimeout) {
      throw new TwoFactorTimeoutError();
    }

    if (user.twoFACode === parseInt(code)) {
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

      await TwoFAManager.user2FAReset(user);
      //console.log('this', user);

      res.status(200).send(user);
    } else {
      throw new BadRequestError('wrong two FA password');
    }
  }
);

export { router as twoFactorRouter };
