import { createServer } from '../src/server';
import express from 'express';
import http from 'http';
import axios, { AxiosError } from 'axios';
import { MysqlDockerTestkit } from './mysql-docker';
import { wait } from './utils';
import fs from 'fs';

const baseUrl = 'http://localhost:8080';
const Url = (s: TemplateStringsArray) => baseUrl + s.join('');
const wordSchema = fs.readFileSync('./src/persistency/mysql/word_schema.sql', 'utf-8');
const jobSchema = fs.readFileSync('./src/persistency/mysql/job_schema.sql', 'utf-8');

describe('e2e testing', () => {
  jest.setTimeout(60000);

  let app: express.Express;
  let server: http.Server;
  const sqlTestKit = new MysqlDockerTestkit({
    port: 32001,
    database: 'defaultDb',
    user: 'user',
    password: 'sa',
  });
  process.env.DB_PORT = '32001';

  beforeAll(async () => {
    await sqlTestKit.start();
    await wait(10000);
  });

  beforeEach(async () => {
    await sqlTestKit.resetSchema([wordSchema, jobSchema]);
    app = createServer();
    await new Promise((resolve) => (server = app.listen(8080, () => resolve(void 0))));
    await wait(500);
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  afterAll(() => {
    sqlTestKit.stop();
  });

  it('should return valid response on word statistics', async () => {
    const response = await axios
      .get(Url`/word-statistics`, {
        params: { word: 'foo' },
      })
      .catch((e) => e);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ count: 0 });
  });

  it('should return reasonable error on bad url', async () => {
    const error: AxiosError = await axios
      .post(Url`/word-counter`, {
        url: 'http://Iam.a.bad.host.name',
      })
      .catch((e) => e);
    expect(error.response?.status).toEqual(500);
  });
});
