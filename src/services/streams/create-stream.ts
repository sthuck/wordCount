import * as builders from './stream-builders';
import { StreamType, StreamRequest } from './type';
import stream from 'stream';

type StreamRequestBuilderMap = {
  [K in StreamType]: (request: StreamRequest & { type: K }) => MaybePromise<stream.Readable>;
};
type MaybePromise<T> = T | Promise<T>;

const streamRequestBuilderMap: StreamRequestBuilderMap = {
  [StreamType.File]: builders.streamFromPath,
  [StreamType.String]: builders.streamFromString,
  [StreamType.Url]: builders.streamFromUrl,
};

export const createStream = (request: StreamRequest): Promise<stream.Readable> => {
  const fn = streamRequestBuilderMap[request.type] as (request: StreamRequest) => MaybePromise<stream.Readable>;
  return Promise.resolve(fn(request));
};
