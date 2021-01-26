import fs from 'fs';
import path from 'path';
import stream from 'stream';
import axios from 'axios';
import { StreamRequestFile, StreamRequestString, StreamRequestUrl } from './type';

export const streamFromPath = (request: StreamRequestFile): stream.Readable => {
  //Do we need to validate use input here? seems like we don't and node.js takes care of this for us, but needs more research
  return fs.createReadStream(request.filePath, { encoding: 'utf-8' });
};

export const streamFromString = (request: StreamRequestString): stream.Readable => {
  return stream.Readable.from(request.string);
};

export const streamFromUrl = (request: StreamRequestUrl): Promise<stream.Readable> => {
  return axios.get(request.url, { responseType: 'stream' }).then((response) => response.data);
};
