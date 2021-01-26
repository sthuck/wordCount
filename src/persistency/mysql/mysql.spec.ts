import { readFileSync } from 'fs';
import path from 'path';
import { MysqlWordRepository } from '.';
import { MysqlDockerTestkit } from '../../../test/mysql-docker';

const schema = readFileSync(path.resolve(__dirname, 'word_schema.sql'), 'utf-8');

describe('MysqlWordRepository', () => {
  jest.setTimeout(60000);
  const options = {
    database: 'defaultDb',
    user: 'user',
    port: 32000,
    password: 'sa',
  };
  const mysqlTestKit = new MysqlDockerTestkit(options);
  let repo: MysqlWordRepository;

  beforeAll(async () => {
    await mysqlTestKit.start();
    await mysqlTestKit.waitForConnection();
  });
  beforeEach(() => mysqlTestKit.resetSchema([schema]));
  beforeEach(() => {
    repo = new MysqlWordRepository(options);
  });

  it('basic get/save', async () => {
    await repo.writeWord({ key: 'a', count: 5 });

    let { count } = await repo.readWord('a');
    expect(count).toEqual(5);
  });

  it('addBulkWordCounts', async () => {
    await repo.writeWord({ key: 'a', count: 5 });
    await repo.addBulkWordCounts([
      ['a', 2],
      ['b', 6],
    ]);

    let { count } = await repo.readWord('a');
    expect(count).toEqual(7);

    ({ count } = await repo.readWord('b'));
    expect(count).toEqual(6);
  });

  it('getTop', async () => {
    await repo.addBulkWordCounts([
      ['a', 10],
      ['b', 20],
      ['c', 5],
      ['d', 30],
    ]);

    const top2 = await repo.getTop(2);
    expect(top2.map((w) => w.key)).toEqual(['d', 'b']);
  });

  afterAll(async () => {
    await mysqlTestKit.stop();
  });
});
