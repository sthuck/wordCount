export interface Word {
  key: string;
  count: number;
}

export interface Job {
  key: string;
  status: JobStatus;
  reason?: string;
}
export enum JobStatus {
  Success = 0,
  Failed = 1,
  Progress = 2,
}
export interface WordRepository {
  writeWord(word: Word): Promise<void>;
  readWord(key: string): Promise<Omit<Word, 'key'>>;
  getTop(howMany: number): Promise<Word[]>;
  addBulkWordCounts(counts: [key: string, count: number][]): Promise<void>;
}

export interface JobRepository {
  writeJob(JobStatus: Job): Promise<void>;
  updateJob(JobStatus: Job): Promise<void>;
  readJob(key: string): Promise<Job>;
}
