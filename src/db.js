import Dexie from 'dexie'

export const db = new Dexie('blobTest');
db.version(1).stores({
  pictures: '++id' // Primary key and indexed props
});