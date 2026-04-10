/**
 * IndexedDB Video Storage for Daily Reflection Videos
 * Stores videos locally in the browser (not on the server)
 * Database: "consistency-videos", Store: "videos"
 * Key: date string (YYYY-MM-DD)
 */

const DB_NAME = 'consistency-videos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'dateKey' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save a video blob for a specific date
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @param {Blob} videoBlob - The video file as a Blob
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the video
 */
export async function saveVideo(dateKey, videoBlob, fileName, mimeType) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        store.put({
            dateKey,
            blob: videoBlob,
            fileName,
            mimeType,
            savedAt: new Date().toISOString()
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Get a video for a specific date
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @returns {Object|null} - { dateKey, blob, fileName, mimeType, savedAt } or null
 */
export async function getVideo(dateKey) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(dateKey);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete a video for a specific date
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 */
export async function deleteVideo(dateKey) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(dateKey);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Convert a date string to a consistent YYYY-MM-DD key
 * @param {string|Date} date 
 * @returns {string}
 */
export function toDateKey(date) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const adjusted = new Date(d.getTime() - (offset * 60 * 1000));
    return adjusted.toISOString().split('T')[0];
}
