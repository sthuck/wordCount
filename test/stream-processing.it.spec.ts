import nock from 'nock';
import { InMemJobRepository, InMemWordRepository } from '../src/persistency/in-mem';
import { createWordCountProcessorFactory } from '../src/services/streams/processors';
import { StreamRequestHandler } from '../src/services/streams/stream-request-handler';
import { StreamType } from '../src/services/streams/type';
import { WordStatistics, WordStatisticsImpl } from '../src/services/word-statistics';
import { wait } from './utils';

describe('word count stream request handler', () => {
  let handler: StreamRequestHandler;
  let wordStatistics: WordStatistics;

  beforeEach(() => {
    const wordRepo = new InMemWordRepository();
    const jobRepo = new InMemJobRepository();
    wordStatistics = new WordStatisticsImpl(wordRepo);

    const streamProcessorFactory = createWordCountProcessorFactory(wordRepo, jobRepo);
    handler = new StreamRequestHandler(streamProcessorFactory);
  });

  it('should count words of simple string', async () => {
    const stream = await handler.createStream({
      type: StreamType.String,
      string: 'abc def efc abc',
    });
    await handler.processStream(stream);
    await wait(100);
    expect(await wordStatistics.getCount('abc')).toEqual(2);
    expect(await wordStatistics.getCount('efc')).toEqual(1);
  });

  it('should return 0 for non existing words', async () => {
    const stream = await handler.createStream({
      type: StreamType.String,
      string: 'abc def efc abc',
    });

    await handler.processStream(stream);
    await wait(100);
    expect(await wordStatistics.getCount('eeeee')).toEqual(0);
  });

  describe('urls', () => {
    afterAll(() => {
      nock.restore();
    });
    it('should count words of url stream', async () => {
      nock('http://foo.bar').get('/stream').reply(200, 'abc def efc abc');
      const stream = await handler.createStream({
        type: StreamType.Url,
        url: 'http://foo.bar/stream',
      });
      await handler.processStream(stream);
      await wait(100);

      expect(await wordStatistics.getCount('abc')).toEqual(2);
      expect(await wordStatistics.getCount('efc')).toEqual(1);
    });
  });

  it('should count words of file stream', async () => {
    nock('http://foo.bar').get('/stream').reply(200, 'abc def efc abc');
    const stream = await handler.createStream({
      type: StreamType.File,
      filePath: './test/fixtures/demo-file-stream',
    });
    await handler.processStream(stream);
    await wait(100);
    expect(await wordStatistics.getCount('abc')).toEqual(2);
    expect(await wordStatistics.getCount('efc')).toEqual(1);
  });
});
