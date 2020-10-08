const COLLECTION = 'budget-tracker';
const OBJ_STORE = 'transactions';

let db;

const request = indexedDB.open(COLLECTION, 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore(OBJ_STORE, {autoIncrement: true});
};

request.onsuccess = (event) => (db = event.target.result);

request.onerror = (event) =>
  console.error(`IndexedDB error: ${event.target.errorCode}`);

window.addEventListener('online', async () => {
  if (!db) return;
  const transaction = db.transaction([OBJ_STORE], 'readwrite');
  const objStore = transaction.objectStore(OBJ_STORE);
  const getAll = objStore.getAll();
  getAll.onsuccess = async () => {
    if (getAll.result.length < 1) return;
    try {
      await fetch('/api/transaction/bulk', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getAll.result),
      });
      // need to open a new transaction to clear object store
      const transaction = db.transaction([OBJ_STORE], 'readwrite');
      const objStore = transaction.objectStore(OBJ_STORE);
      objStore.clear();
      alert('Transactions submitted!');
    } catch (err) {
      console.error(err);
    }
  };
});

export default function saveRecord(record) {
  if (!db) return;
  const transaction = db.transaction([OBJ_STORE], 'readwrite');
  const objStore = transaction.objectStore(OBJ_STORE);
  objStore.add(record);
}
