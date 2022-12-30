import { Request, Response, NextFunction } from 'express';

import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { CustomError } from '../errors/custom-error';

export const errorNet = (fn: Function) => {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(async (e: CustomError) => {
      if (e) {
        console.log(e);

        if (e.statusCode > 400 || !e.statusCode) {
          console.log('\x1b[31m', 'Catch Error: ');
          console.log('\x1b[37m', e.stack);
        }
        next(e);
      }
    });
  };
};

export class Rollback {
  //instance: Rollback;
  inputs: Object[] = [];

  constructor(private instance: Rollback) {
    if (this.instance == undefined) {
      this.instance = this;
    }
  }
}

// const rollbackObj = new Rollback();
// const rollback = rollbackObj.instance;
