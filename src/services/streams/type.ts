export enum StreamType {
  File,
  Url,
  String,
}

export interface StreamRequestFile {
  filePath: string;
  type: StreamType.File;
}

export interface StreamRequestUrl {
  url: string;
  type: StreamType.Url;
}

export interface StreamRequestString {
  string: string;
  type: StreamType.String;
}

export type StreamRequest = StreamRequestFile | StreamRequestUrl | StreamRequestString;

export const isStreamRequestFile = (request: StreamRequest): request is StreamRequestFile =>
  request.type === StreamType.File;

export const isStreamRequestUrl = (request: StreamRequest): request is StreamRequestUrl =>
  request.type === StreamType.Url;

export const isStreamRequestString = (request: StreamRequest): request is StreamRequestString =>
  request.type === StreamType.String;
