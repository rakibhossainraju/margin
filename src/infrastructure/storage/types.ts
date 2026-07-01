export interface BaseRecord {
  version: string;
}

export interface Highlight {
  id: string;
  text: string;
}

export interface HighlightRecord extends BaseRecord {
  highlights: Highlight[];
}

export interface StorageMap {
  highlights: HighlightRecord;
}

export type StorageNamespace = keyof StorageMap;
