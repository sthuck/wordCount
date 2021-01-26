import fs from 'fs';
import Knex from 'knex';
import { loggerFactory } from '../../utils/logger';
import { Word, WordRepository } from '../types';
import { BaseMysqlRepository } from './base';

const schema = fs.readFileSync(__dirname.replace('/dist', '') + '/word_schema.sql', 'utf-8');
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

  async readWord(id: string): Promise<Pick<Word, 'count'>> {
    const result = await this.knex<Word>(TABLE_NAME).select('count').where({ id });

    return result?.[0];
  }

  addBulkWordCounts(counts: [id: string, count: number][]): Promise<void> {
    console.log(counts.filter((c) => c.length !== 2));
    const itemsSql = counts.map(([id, count]) => this.knex.raw('( ?, ? )', [count, id])).join(', ');

    const query =
      this.knex.raw('INSERT INTO ?? (`count`, `id`) VALUES ', [TABLE_NAME]) +
      itemsSql +
      this.knex.raw(' as updates ON DUPLICATE KEY UPDATE `count` = updates.`count` + ??.`count`;', [TABLE_NAME]);
    return this.knex.raw(query).then((r) => r);
  }

  getTop(howMany: number) {
    return this.knex<Word>(TABLE_NAME)
      .select('*')
      .orderBy('count', 'desc')
      .limit(howMany)
      .then((r) => r);
  }
}
