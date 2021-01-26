import fs from 'fs';
import Knex from 'knex';
import { loggerFactory } from '../../utils/logger';
import { Word, WordRepository } from '../types';
import { BaseMysqlRepository } from './base';

const schema = fs.readFileSync(__dirname + '/word_schema.sql', 'utf-8');
const TABLE_NAME = 'word_count';
const logger = loggerFactory('MysqlWordRepository');

export class MysqlWordRepository extends BaseMysqlRepository implements WordRepository {
  protected tableName = TABLE_NAME;
  protected schema = schema;

  constructor(options: Knex.MySql2ConnectionConfig) {
    super(options);
  }

  async writeWord(word: Word): Promise<void> {
    await this.knex.insert(word).into(TABLE_NAME);
  }

  async readWord(key: string): Promise<Pick<Word, 'count'>> {
    const result = await this.knex<Word>(TABLE_NAME).select('count').where({ key });

    return result?.[0];
  }

  addBulkWordCounts(counts: [key: string, count: number][]): Promise<void> {
    const itemsSql = counts.map(([key, count]) => this.knex.raw('( ?, ? )', [count, key])).join(', ');
    const query = this.knex.raw(
      'INSERT INTO ?? (`count`, `key`) VALUES ' +
        itemsSql +
        ' as updates ON DUPLICATE KEY UPDATE `count` = updates.`count` + ??.`count`;',
      [TABLE_NAME, TABLE_NAME],
    );
    return query.then((r) => r);
  }

  getTop(howMany: number) {
    return this.knex<Word>(TABLE_NAME)
      .select('*')
      .orderBy('count', 'desc')
      .limit(howMany)
      .then((r) => r);
  }
}
