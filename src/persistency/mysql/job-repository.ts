import fs from 'fs';
import Knex from 'knex';
import { loggerFactory } from '../../utils/logger';
import { Job, JobRepository } from '../types';
import { BaseMysqlRepository } from './base';

const schema = fs.readFileSync(__dirname + '/job_schema.sql', 'utf-8');
const TABLE_NAME = 'job_status';
const logger = loggerFactory('MysqlJobRepository');

export class MysqlJobRepository extends BaseMysqlRepository implements JobRepository {
  protected tableName = TABLE_NAME;
  protected schema = schema;

  constructor(connectionOptions: Knex.MySql2ConnectionConfig) {
    super(connectionOptions);
  }

  async writeJob(job: Job): Promise<void> {
    await this.knex.insert(job).into(TABLE_NAME);
  }

  async updateJob(job: Job): Promise<void> {
    const { key, ...rest } = job;
    await this.knex<Job>(TABLE_NAME).update(rest).where({ key: job.key });
  }

  async readJob(key: string): Promise<Job> {
    const result = await this.knex<Job>(TABLE_NAME).select('*').where({ key });

    return result?.[0];
  }
}
