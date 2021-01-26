import { Job, JobRepository, Word, WordRepository } from '../types';

class BaseInMemRepository<T extends { key: string }> {
  protected storage: Record<string, T> = {};

  protected writeEntity(item: T) {
    this.storage[item.key] = item;
    return Promise.resolve();
  }

  protected readEntity(key: string): Promise<T> {
    return Promise.resolve(this.storage[key]);
  }
}
export class InMemWordRepository extends BaseInMemRepository<Word> implements WordRepository {
  writeWord = this.writeEntity;

  readWord = this.readEntity;

  addBulkWordCounts(counts: [key: string, count: number][]): Promise<void> {
    counts.forEach(([key, count]) => {
      const item = this.storage[key] || { key, count: 0 };
      item.count += count;
      this.storage[key] = item;
    });
    return Promise.resolve();
  }

  getTop(howMany: number) {
    return Promise.resolve(
      Object.entries(this.storage)
        .sort(([, w1], [, w2]) => -1 * (w1.count - w2.count))
        .slice(0, howMany)
        .map(([, w]) => w),
    );
  }
}

export class InMemJobRepository extends BaseInMemRepository<Job> implements JobRepository {
  writeJob = this.writeEntity;
  readJob = this.readEntity;
  updateJob = this.writeEntity;
}
