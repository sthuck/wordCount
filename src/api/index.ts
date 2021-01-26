import bodyParser from 'body-parser';
import express from 'express';
import { JobStatusService } from '../services/job-status';
import { StreamProcessorFactory } from '../services/streams/processors';
import { WordStatistics } from '../services/word-statistics';
import { wordCounterApi } from './word-counter';
import { wordStatisticsApi } from './word-statistics';
import { jobStatusApi } from './job-status';
interface Deps {
  wordStatistics: WordStatistics;
  streamProcessorFactory: StreamProcessorFactory;
  jobStatusService: JobStatusService;
}

export const createExpressApp = (dependencies: Deps) => {
  const { wordStatistics, streamProcessorFactory, jobStatusService } = dependencies;
  //Idea is we can switch implementation easily based only on streamProcessorFactory we pass

  const app = express();
  app
    .use(bodyParser.json())
    .use(wordStatisticsApi(wordStatistics))
    .use(wordCounterApi(streamProcessorFactory))
    .use(jobStatusApi(jobStatusService));

  return app;
};
