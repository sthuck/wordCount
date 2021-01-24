export interface Word {
  key: string;
  count: number;
}

export interface WordRepository {
  writeWord(word: Word): Promise<void>
  readWord(key: string): Promise<Omit<Word, 'key'>>;
  addCountToWord(key: string, count: number): Promise<void>;
}