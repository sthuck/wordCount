import stream from 'stream';

export abstract class StreamProcessor {
  protected abstract onStreamData(aStream: stream.Readable, chucnk: string | Buffer): void;
  protected abstract onStreamError(error: any, reject: Function): void;
  protected abstract onStreamEnd(resolve: Function, reject: Function): void;
  protected onStreamCreate(resolve: Function, reject: Function) {}

  processStream(aStream: stream.Readable): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onStreamCreate(resolve, reject);

      aStream
        .on('data', (chunk) => this.onStreamData(aStream, chunk))
        .on('error', (e) => this.onStreamError(e, reject))
        .on('end', () => this.onStreamEnd(resolve, reject));
    });
  }
}

export interface StreamProcessorFactory {
  build(): StreamProcessor;
}
