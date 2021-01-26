import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import * as Joi from 'joi';
import 'joi-extract-type';

export const CountWordsRequest = Joi.object({
  url: Joi.string().uri(),
  string: Joi.string().min(1),
  path: Joi.string().min(1),
}).xor('url', 'string', 'path');

export interface CountWordsRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    url?: string;
    string?: string;
    path?: string;
  };
}

export const WordStatisticsRequest = Joi.object({
  word: Joi.string().min(1),
});

export interface WordStatisticsRequest extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    word: string;
  };
}

export const JobStatusRequest = Joi.object({
  jobId: Joi.string().uuid(),
});

export interface JobStatusRequest extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    jobId: string;
  };
}
