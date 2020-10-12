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

async function uploadLocal() {
  if (!db) return;
  const transaction = db.transaction([OBJ_STORE], 'readwrite');
  const objStore = transaction.objectStore(OBJ_STORE);
  const getAll = objStore.getAll();
  getAll.onsuccess = async () => {
    if (getAll.result.length < 1) return;
    try {
      const response = await fetch('/api/transaction/bulk', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getAll.result),
      });
      if (navigator.onLine && !response.ok && response.status === 503)
        return retryAfter(120);
      // need to open a new transaction to clear object store
      const transaction = db.transaction([OBJ_STORE], 'readwrite');
      const objStore = transaction.objectStore(OBJ_STORE);
      objStore.clear();
      alert('Transactions submitted!');
    } catch (err) {
      console.error(err);
    }
  };
}
window.addEventListener('online', uploadLocal);

function retryAfter(seconds) {
  if (!navigator.onLine) return console.info('Offline. Will retry when online');
  console.warn(`Server not responding, waiting ${seconds}s`);
  setTimeout(uploadLocal, seconds * 1000);
}

function idbSave(record) {
  if (!db) return;
  const transaction = db.transaction([OBJ_STORE], 'readwrite');
  const objStore = transaction.objectStore(OBJ_STORE);
  objStore.add(record);
}

export default async function saveHandler(transaction) {
  try {
    const response = await fetch('/api/transaction', {
      method: 'POST',
      body: JSON.stringify(transaction),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok && response.status === 503) {
      idbSave(transaction);
      retryAfter(120);
      return;
    }
    return response.json();
  } catch (err) {
    // we're offline
    idbSave(transaction);
  }
}
