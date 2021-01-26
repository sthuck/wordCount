import { Job, JobRepository, Word, WordRepository } from '../types';

class BaseInMemRepository<T extends { id: string }> {
  protected storage: Record<string, T> = {};

  protected writeEntity(item: T) {
    this.storage[item.id] = item;
    return Promise.resolve();
  }

  protected readEntity(id: string): Promise<T> {
    return Promise.resolve(this.storage[id]);
  }
}
export class InMemWordRepository extends BaseInMemRepository<Word> implements WordRepository {
  writeWord = this.writeEntity;

  readWord = this.readEntity;

  addBulkWordCounts(counts: [id: string, count: number][]): Promise<void> {
    counts.forEach(([id, count]) => {
      const item = this.storage[id] || { id: id, count: 0 };
      item.count += count;
      this.storage[id] = item;
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
