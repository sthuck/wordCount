import { errorLogger, loggerFactory } from '../../utils/logger';
import Knex from 'knex';

const logger = loggerFactory('BaseMysqlRepository');

export abstract class BaseMysqlRepository {
  protected abstract schema: string;
  protected abstract tableName: string;

  protected knex: Knex;
  constructor(connectionOptions: Knex.MySql2ConnectionConfig) {
    this.knex = Knex({
      client: 'mysql2',
      connection: connectionOptions,
      pool: { min: 1, max: 10 },
    });
    setTimeout(() => this.verifySchema());
  }

  private verifySchema() {
    this.knex.schema.hasTable(this.tableName).then((exists) => {
      if (!exists) {
        this.knex
          .raw(this.schema)
          .then(() => {
            logger('created schema');
          })
          .catch((e) => errorLogger('failed creating schema', e));
      }
    });
  }
}
