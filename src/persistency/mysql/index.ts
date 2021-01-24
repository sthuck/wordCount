import {Word, WordRepository} from "../types";

export class MysqlWordRepository implements WordRepository {
  private storage: Record<string, Word> = {};
  writeWord(word: Word): Promise<void> {
    this.storage[word.key] = word;
    return Promise.resolve();
  }
  
  readWord(key: string): Promise<Pick<Word, 'count'>> {
    return Promise.resolve(this.storage[key]);
  }

  addCountToWord(key: string, count: number): Promise<void> {
    const item = this.storage[key] || {key, count: 0};
    item.count += count;
    this.storage[key] = item;
    return Promise.resolve();
  }
  
}