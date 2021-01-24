import stream from 'stream';
import {last} from 'lodash';
import {WordRepository} from '../persistency/types';

class StreamProcessor {
  constructor(private wordRepo: WordRepository) {}
}

async function processStream(aStream: stream.Readable) {
  let prevData = '';
  aStream.on('readable', () => {
    const data = prevData + aStream.read();
    const words = data.split('\s');
    prevData = last(words) || ''; //In case our buffer ends in the middle of word
  });
};