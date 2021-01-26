import stream from 'stream';
import { last } from 'lodash';
import { JobRepository, WordRepository, JobStatus } from '../../../persistency/types';
import { loggerFactory } from '../../../utils/logger';
import { StreamProcessorFactory, StreamProcessor } from './base';
import { v4 as uuidV4 } from 'uuid';

const logger = loggerFactory('StreamProcessor');

export const createWordCountProcessorFactory = (
  wordRepo: WordRepository,
  jobRepo: JobRepository,
): StreamProcessorFactory => {
  return {
    build() {
      return new WordCountStreamProcessor(wordRepo, jobRepo);
    },
  };
};

export class WordCountStreamProcessor extends StreamProcessor {
  private wordsAggregated = {
    counter: 0,
    words: new Map<string, number>(),
  };
  private prevLastWord = '';
  private jobId: string = '';

  constructor(private wordRepo: WordRepository, private jobRepo: JobRepository, private PERSIST_EVERY_X_WORDS = 1000) {
    super();
  }

  private resetState() {
    this.wordsAggregated = {
      counter: 0,
      words: new Map<string, number>(),
    };
  }

  private async persistWords() {
    const wordsAndCounts = Array.from(this.wordsAggregated.words.entries());
    if (wordsAndCounts.length) {
      await this.wordRepo.addBulkWordCounts(wordsAndCounts);
    }
  }

  async onStreamCreate(resolve: Function) {
    this.jobId = uuidV4();
    await this.jobRepo.writeJob({
      key: this.jobId,
      status: JobStatus.Progress,
    });

    resolve(this.jobId);
  }

  protected onStreamData(aStream: stream.Readable, chunk: string) {
    const data = this.prevLastWord + chunk;
    const words = data.split(/\s/);

    this.prevLastWord = last(words) || ''; //In case our buffer ends in the middle of word

    const wordsToSave = words.slice(0, -1);
    wordsToSave.forEach((word) => {
      this.wordsAggregated.words.set(word, (this.wordsAggregated.words.get(word) || 0) + 1);
    });
    this.wordsAggregated.counter += wordsToSave.length;

    if (this.wordsAggregated.counter > this.PERSIST_EVERY_X_WORDS) {
      aStream.pause();
      this.persistWords()
        .then(() => {
          this.resetState();
          aStream.resume();
        })
        .catch((e) => {
          logger.log('Error in persisting words', e);
          aStream.destroy(e);
        });
    }
  }

  protected async onStreamError(reason: any, reject: Function) {
    await this.jobRepo.updateJob({ key: this.jobId, status: JobStatus.Failed, reason: reason?.toString() });
  }

  protected onStreamEnd(resolve: Function, reject: Function) {
    if (this.prevLastWord) {
      this.wordsAggregated.words.set(this.prevLastWord, (this.wordsAggregated.words.get(this.prevLastWord) || 0) + 1);
    }

    this.persistWords()
      .catch((e) => {
        logger.log('Error in persisting words', e);
        this.onStreamError(e, reject);
      })
      .then(() => {
        this.jobRepo.updateJob({ key: this.jobId, status: JobStatus.Success });
      });
  }
}
