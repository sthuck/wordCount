import { Word, WordRepository } from '../../persistency/types';

export interface WordStatistics {
  getCount(word: string): Promise<number>;
  getTop(count: number): Promise<Word[]>;
}

export class WordStatisticsImpl implements WordStatistics {
  constructor(private wordRepo: WordRepository) {}

  async getCount(word: string) {
    const result = await this.wordRepo.readWord(word);
    return result ? result.count : 0;
  }

  async getTop(count: number) {
    return this.wordRepo.getTop(count);
  }
}
