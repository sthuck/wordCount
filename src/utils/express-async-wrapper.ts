import { Request, Response, NextFunction } from 'express';
import { errorLogger } from './logger';
export const asyncWrapper = <T extends Request>(fn: (req: T, res: Response) => Promise<any>) => {
  return (req: T, res: Response, next: NextFunction) => {
    fn(req, res).catch((e) => {
      errorLogger(e.toString());
      res.sendStatus(500);
      next(e);
    });
  };
};
