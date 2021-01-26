import { InMemJobRepository, InMemWordRepository } from '../../../persistency/in-mem';
import { WordCountStreamProcessor } from './word-count-processor';
import stream from 'stream';
import { JobRepository, JobStatus, WordRepository } from '../../../persistency/types';
import { wait } from '../../../../test/utils';

describe('word count processor stream', () => {
  let processor: WordCountStreamProcessor;
  let wordRepo: WordRepository;
  let jobRepo: JobRepository;

  const getCount = (word: string) => wordRepo.readWord(word).then((r) => r?.count || 0);

  beforeEach(() => {
    wordRepo = new InMemWordRepository();
    jobRepo = new InMemJobRepository();
    processor = new WordCountStreamProcessor(wordRepo, jobRepo);
  });

  it('should handle input streamed mid word, case 1', async () => {
    const aStream = stream.Readable.from(['abc d', 'ef']);
    await processor.processStream(aStream);
    await wait(100);

    expect(await getCount('abc')).toEqual(1);
    expect(await getCount('def')).toEqual(1);
  });

  it('should handle input streamed mid word, case 2', async () => {
    const aStream = stream.Readable.from(['abc', 'def']);
    await processor.processStream(aStream);
    await wait(100);

    expect(await getCount('abc')).toEqual(0);
    expect(await getCount('def')).toEqual(0);
    expect(await getCount('abcdef')).toEqual(1);
  });

  it('should handle input streamed mid word, case 3', async () => {
    const aStream = stream.Readable.from(['abc ', 'def']);
    await processor.processStream(aStream);
    await wait(100);

    expect(await getCount('abc')).toEqual(1);
    expect(await getCount('def')).toEqual(1);
  });

  it('should handle input streamed mid word, case 4', async () => {
    const aStream = stream.Readable.from(['abc d', 'ef g', 'hi']);
    await processor.processStream(aStream);
    await wait(100);

    expect(await getCount('abc')).toEqual(1);
    expect(await getCount('def')).toEqual(1);
    expect(await getCount('ghi')).toEqual(1);
  });

  it('should handle writing to repo mid stream', async () => {
    processor = new WordCountStreamProcessor(wordRepo, jobRepo, 4);
    const demoStream = 'a b c d e f g h i j k l m';
    const aStream = stream.Readable.from([demoStream]);
    await processor.processStream(aStream);
    await wait(100);

    await Promise.all(demoStream.split(' ').map(async (char) => expect(await getCount(char)).toEqual(1)));
  });

  describe('job status', () => {
    it('should set status according to stream progress', async () => {
      const aStream = new (class extends stream.Readable {
        _read() {
          this.push(null);
        }
      })();

      const jobId = await processor.processStream(aStream);
      expect((await jobRepo.readJob(jobId)).status).toEqual(JobStatus.Progress);
      await wait(200);
      expect((await jobRepo.readJob(jobId)).status).toEqual(JobStatus.Success);
    });

    it('should set error status on error', async () => {
      const aStream = new stream.Readable();
      const jobId = await processor.processStream(aStream);
      expect((await jobRepo.readJob(jobId)).status).toEqual(JobStatus.Progress);
      aStream.destroy(new Error('boo'));
      await wait(200);
      expect((await jobRepo.readJob(jobId)).status).toEqual(JobStatus.Failed);
    });
  });
});
