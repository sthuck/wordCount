import { Response, Router } from 'express';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { StreamRequestHandler } from '../services/streams';
import { StreamProcessorFactory } from '../services/streams/processors';
import { StreamRequest, StreamType } from '../services/streams/type';
import { CountWordsRequest } from './types';
import { asyncWrapper } from '../utils/express-async-wrapper';

export const wordCounterApi = (streamProcessorFactory: StreamProcessorFactory) => {
  const streamRequestHandler = new StreamRequestHandler(streamProcessorFactory);
  const validator = createValidator().body(CountWordsRequest);

  return Router().post(
    '/word-counter',
    validator,
    asyncWrapper(async (req: ValidatedRequest<CountWordsRequest>, res: Response) => {
      const request = httpRequestToStreamRequest(req);

      const stream = await streamRequestHandler.createStream(request);
      const jobId = await streamRequestHandler.processStream(stream);
      res.send({ jobId });
    }),
  );
};

function httpRequestToStreamRequest(httpRequest: ValidatedRequest<CountWordsRequest>): StreamRequest {
  const { path, string, url } = httpRequest.body;
  if (path) {
    return { type: StreamType.File, filePath: path };
  } else if (url) {
    return { type: StreamType.Url, url };
  } else {
    return { type: StreamType.String, string: string! };
  }
}
