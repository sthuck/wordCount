import Docker from 'dockerode';
import mysql from 'mysql2/promise';
import { loggerFactory } from '../src/utils/logger';
import Chance from 'chance';
import { waitUntil } from './utils';

const chance = new Chance();
const docker = new Docker();
const logger = loggerFactory('mysqlDocker');

interface MysqlOptions {
  database: string;
  user: string;
  password: string;
  port: number;
}

export class MysqlDockerTestkit {
  private options: MysqlOptions;
  private container: Docker.Container | undefined;

  constructor(options: Partial<MysqlOptions>) {
    const { database, user, password, port } = {
      user: chance.word(),
      password: chance.word(),
      port: chance.integer({ min: 49152, max: 65536 }),
      database: chance.word(),
      ...options,
    };
    this.options = { user, password, port, database };
  }

  getOptions() {
    return this.options;
  }

  private async pullImage() {
    const stream = await docker.pull('mysql:8', {});
    const onProgress = (event: any) => {
      if (event.status === 'Downloading') {
        logger(`  ${event.id}: ${event.status} ${event.progress}`);
      }
    };

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(
        stream,
        (err: Error, res: unknown) => (err ? reject(err) : resolve(res)),
        onProgress,
      );
    });
  }
  async start() {
    const { database: dbName, user, password, port } = this.options;

    await this.pullImage();
    logger('finished pull');

    const Env = [
      `MYSQL_DATABASE=${dbName}`,
      `MYSQL_ROOT_PASSWORD=${chance.word()}`,
      `MYSQL_USER=${user}`,
      `MYSQL_PASSWORD=${password}`,
    ];
    const container = await docker.createContainer({
      Image: 'mysql:8',
      Env,
      ExposedPorts: { '3306/tcp': {} },
      name: 'wc-mysql' + '_' + chance.word(),
      HostConfig: {
        PortBindings: { '3306/tcp': [{ HostPort: port.toString() }] },
        AutoRemove: true,
      },
    });
    await container.start();
    logger('finished staring the container');
    this.container = container;
    return container;
  }

  async waitForConnection() {
    const tryToConnect = async () => {
      logger('trying to connect...');
      const { database: dbName, port, password, user } = this.options;
      const connection = await mysql.createConnection({
        host: 'localhost',
        port,
        user,
        password,
        database: dbName,
      });
      await connection.query('select 1=1');
      logger('success');
    };
    await waitUntil(tryToConnect, { interval: 500 });
  }

  async resetSchema(schemas: string[]) {
    const { database: dbName, port, password, user } = this.options;
    const connection = await mysql.createConnection({
      host: 'localhost',
      port,
      user,
      password,
      database: dbName,
    });
    const findTablesQuery = `
SELECT table_name
FROM information_schema.tables
WHERE table_schema = '${dbName}';`;
    const [rows] = await connection.query(findTablesQuery);
    const tables = (rows as any[]).map((row) => row['TABLE_NAME']);
    for (const table of tables) {
      const dropQuery = `drop table if exists \`${table}\`;`;
      await connection.query(dropQuery);
    }

    for (const schema of schemas) {
      await connection.query(schema);
    }
  }

  async stop() {
    if (this.container) {
      return this.container.stop();
    }
  }
}
