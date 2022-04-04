import type { Static } from 'runtypes';
import { Record, String, Number } from 'runtypes';

export const Schema = Record({
  name: String,
  version: Number,
  icon: String,
  entry: String,
});

export type T = Static<typeof Schema>;
