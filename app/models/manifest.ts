import type { Static } from 'runtypes';
import { Record, String, Number } from 'runtypes';

export const ManifestSchema = Record({
  name: String,
  version: Number,
  icon: String,
  entry: String,
});

export type Manifest = Static<typeof ManifestSchema>;
