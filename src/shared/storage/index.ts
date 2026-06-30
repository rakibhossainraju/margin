import { StorageMap, StorageNamespace } from './types';

/**
 * Helper to construct namespaced storage keys.
 */
function getStorageKey(namespace: StorageNamespace, subKey: string): string {
  return `${namespace}:${subKey}`;
}

/**
 * Default structures for records when they do not exist in storage yet.
 */
const DEFAULT_RECORDS: { [K in StorageNamespace]: Omit<StorageMap[K], 'version'> } = {
  highlights: {
    highlights: [],
  },
};

/**
 * Returns a default record populated with the current manifest version.
 */
function getDefaultRecord<K extends StorageNamespace>(namespace: K): StorageMap[K] {
  const version = chrome.runtime.getManifest().version;
  return {
    version,
    ...DEFAULT_RECORDS[namespace],
  } as unknown as StorageMap[K];
}

/**
 * Migration seam invoked on read. No-op in Phase 1 since no prior versions exist.
 */
function migrate<K extends StorageNamespace>(
  record: any,
  namespace: K
): StorageMap[K] {
  const currentVersion = chrome.runtime.getManifest().version;
  if (record.version !== currentVersion) {
    console.log(
      `[margin:storage] Migration triggered for ${namespace}. Record version: ${record.version}, current version: ${currentVersion}`
    );
  }
  return record as StorageMap[K];
}

/**
 * Reads a record by namespace and subKey, defaulting to a typed empty value if absent.
 */
export async function get<K extends StorageNamespace>(
  namespace: K,
  subKey: string
): Promise<StorageMap[K]> {
  const key = getStorageKey(namespace, subKey);
  const result = await chrome.storage.local.get(key);
  const record = result[key];
  if (!record) {
    return getDefaultRecord(namespace);
  }
  return migrate(record, namespace);
}

/**
 * Writes a record to storage, stamping the current manifest version automatically.
 */
export async function set<K extends StorageNamespace>(
  namespace: K,
  subKey: string,
  data: Omit<StorageMap[K], 'version'>
): Promise<void> {
  const key = getStorageKey(namespace, subKey);
  const version = chrome.runtime.getManifest().version;
  const record: StorageMap[K] = {
    version,
    ...data,
  } as unknown as StorageMap[K];

  await chrome.storage.local.set({ [key]: record });
}

/**
 * Atomically updates a record in storage by loading it, applying the updater callback, and saving.
 */
export async function update<K extends StorageNamespace>(
  namespace: K,
  subKey: string,
  updater: (current: StorageMap[K]) => Omit<StorageMap[K], 'version'> | Promise<Omit<StorageMap[K], 'version'>>
): Promise<void> {
  const current = await get(namespace, subKey);
  const updatedData = await updater(current);
  await set(namespace, subKey, updatedData);
}

/**
 * Removes a record from storage.
 */
export async function remove(
  namespace: StorageNamespace,
  subKey: string
): Promise<void> {
  const key = getStorageKey(namespace, subKey);
  await chrome.storage.local.remove(key);
}
