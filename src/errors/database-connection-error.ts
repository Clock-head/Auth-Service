import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  reason = 'failed to connect to database';
  statusCode = 500;

  constructor() {
    super('Error connecting to DB');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.reason,
      },
    ];
  }
}
