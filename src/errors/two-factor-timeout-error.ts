import { CustomError } from './custom-error';

export class TwoFactorTimeoutError extends CustomError {
  statusCode = 400;

  constructor() {
    super('two factor code has expired');

    Object.setPrototypeOf(this, TwoFactorTimeoutError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'two factor code expired.',
      },
    ];
  }
}
