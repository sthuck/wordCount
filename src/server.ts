import { createExpressApp } from './api';
import { mysqlSettingsFromEnv } from './config';
import { InMemJobRepository, InMemWordRepository } from './persistency/in-mem';
import { MysqlWordRepository } from './persistency/mysql';
import { MysqlJobRepository } from './persistency/mysql/job-repository';
import { JobRepository, WordRepository } from './persistency/types';
import { JobStatusService, JobStatusServiceImpl } from './services/job-status';
import { createWordCountProcessorFactory } from './services/streams/processors';
import { WordStatistics, WordStatisticsImpl } from './services/word-statistics';

export const createServer = () => {
  //Wiring dependencies
  //in real world we would do something similar with some dependency injection framework
  const mysqlSettings = mysqlSettingsFromEnv();
  const wordRepo: WordRepository = process.env.USE_IN_MEM
    ? new InMemWordRepository()
    : new MysqlWordRepository(mysqlSettings);
  const jobRepo: JobRepository = process.env.USE_IN_MEM
    ? new InMemJobRepository()
    : new MysqlJobRepository(mysqlSettings);

  const wordStatistics: WordStatistics = new WordStatisticsImpl(wordRepo);
  const jobStatusService: JobStatusService = new JobStatusServiceImpl(jobRepo);
  const streamProcessorFactory = createWordCountProcessorFactory(wordRepo, jobRepo);

  const app = createExpressApp({ streamProcessorFactory, wordStatistics, jobStatusService });
  return app;
};
