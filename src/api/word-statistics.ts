import { Router, Response, Request } from 'express';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { WordStatistics } from '../services/word-statistics';
import { WordStatisticsRequest } from './types';
import { asyncWrapper } from '../utils/express-async-wrapper';

export const wordStatisticsApi = (wordStatistics: WordStatistics) => {
  const validator = createValidator().body(WordStatisticsRequest);

  return Router()
    .get(
      '/word-statistics',
      validator,
      asyncWrapper(async (req: ValidatedRequest<WordStatisticsRequest>, res: Response) => {
        const word = req.query.word;

        const count = await wordStatistics.getCount(word);
        res.json({ count });
      }),
    )
    .get(
      '/top-50-words',
      asyncWrapper(async (req: Request, res: Response) => {
        const words = await wordStatistics.getTop(50);
        res.json(words);
      }),
    );
};
