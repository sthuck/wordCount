import { Router, Response } from 'express';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { JobStatusRequest } from './types';
import { asyncWrapper } from '../utils/express-async-wrapper';
import { JobNotFoundError, JobStatusService } from '../services/job-status';

export const jobStatusApi = (JobService: JobStatusService) => {
  const validator = createValidator().body(JobStatusRequest);

  return Router().get(
    '/job-status',
    validator,
    asyncWrapper(async (req: ValidatedRequest<JobStatusRequest>, res: Response) => {
      const jobId = req.query.jobId;

      await JobService.getStatus(jobId)
        .catch((e) => {
          if (e instanceof JobNotFoundError) {
            res.sendStatus(404).send(e.message);
          } else {
            throw e;
          }
        })
        .then((job) => {
          res.json(job);
        });
    }),
  );
};
