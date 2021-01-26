import { Job, JobRepository } from '../../persistency/types';

export interface JobStatusService {
  getStatus(id: string): Promise<Job>;
}

export class JobStatusServiceImpl implements JobStatusService {
  constructor(private jobRepo: JobRepository) {}

  async getStatus(id: string) {
    const result = await this.jobRepo.readJob(id);
    if (result) {
      return result;
    }
    throw new JobNotFoundError('job not found with id ' + id);
  }
}

export class JobNotFoundError extends Error {}
