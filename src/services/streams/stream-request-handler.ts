import { loggerFactory } from '../../utils/logger';
import { createStream } from './create-stream';
import { StreamProcessor, StreamProcessorFactory } from './processors';
import { StreamRequest } from './type';
import { Readable } from 'stream';

const logger = loggerFactory('StreamRequestHandler');

export class StreamRequestHandler {
  constructor(private readonly processorFactory: StreamProcessorFactory) {}

  async createStream(request: StreamRequest) {
    return createStream(request);
  }

  async processStream(stream: Readable) {
    const streamProcessor = this.processorFactory.build();
    return streamProcessor.processStream(stream);
  }
}
