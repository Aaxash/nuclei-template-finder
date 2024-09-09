import pako from 'pako';

export async function fetchGzFile(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const decompressedData = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
  return JSON.parse(decompressedData);
}

export async function fetchHashFile(url) {
  const response = await fetch(url);
  return response.text();
}


export function setupIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TemplateDatabase', 1); // Incremented version
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
  
        // Create object stores if they do not exist
        if (!db.objectStoreNames.contains('Templatedata')) {
          db.createObjectStore('Templatedata', {keyPath: 'p', autoIncrement: true});
        }
         
        if (!db.objectStoreNames.contains('Metadata')) {
          db.createObjectStore('Metadata',{ keyPath: 'key' });
        }
      };
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  export function storeData(db, dataArray, hash) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['Templatedata', 'Metadata'], 'readwrite');
      const dataStore = transaction.objectStore('Templatedata');
      const metaStore = transaction.objectStore('Metadata');

      // Handle transaction error
      transaction.onerror = (event) => {
        reject(event.target.error);
      };
  
      // Handle transaction completion
      transaction.oncomplete = () => {
        resolve();
      };
  
      // Iterate over the dataArray to store each object in Templatedata
      dataArray.forEach((data) => {
        const dataRequest = dataStore.put(data);
        dataRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
  
      // Store metadata (hash)
      const metaRequest = metaStore.put({ key: 'TemplateDataHash', value: hash });
      metaRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  
  export function getMetadata(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['Metadata'], 'readonly');
      const store = transaction.objectStore('Metadata');
      const request = store.get('TemplateDataHash');
  
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
// Updated searchData function
export function searchData(db, query) {
  return new Promise((resolve, reject) => {
      const transaction = db.transaction('Templatedata', 'readonly');
      const store = transaction.objectStore('Templatedata');
      const results = [];
      const lowerQuery = query.toLowerCase();

      const request = store.openCursor();

      request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
              const item = cursor.value;
              // Check if any of the fields in the item contain the query string
              if (Object.values(item).some(value => typeof value === 'string' && value.toLowerCase().includes(lowerQuery))) {
                  results.push(item);
              }
              cursor.continue();
          } else {
              resolve(Array.isArray(results) ? results : []); // Ensure results is an array
          }
      };

      request.onerror = (event) => {
          console.error('Error searching data:', event.target.error);
          reject(event.target.error);
      };
  });
}
