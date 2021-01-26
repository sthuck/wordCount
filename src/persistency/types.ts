export interface Word {
  id: string;
  count: number;
}

export interface Job {
  id: string;
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
  readWord(id: string): Promise<Omit<Word, 'id'>>;
  getTop(howMany: number): Promise<Word[]>;
  addBulkWordCounts(counts: [id: string, count: number][]): Promise<void>;
}

export interface JobRepository {
  writeJob(JobStatus: Job): Promise<void>;
  updateJob(JobStatus: Job): Promise<void>;
  readJob(id: string): Promise<Job>;
}
