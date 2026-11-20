import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { placeholderWishes } from '../data/placeholderWishes.js';

// Local in-memory store for dev session when Firebase is not yet configured
let localDevWishes = [...placeholderWishes];
const devSubscribers = new Set();

const notifyDevSubscribers = () => {
  const approved = getApprovedFromList(localDevWishes);
  devSubscribers.forEach((cb) => {
    try {
      cb(approved);
    } catch (e) {
      console.error('Error notifying dev subscriber:', e);
    }
  });
};

/**
 * Helper to filter approved wishes and sort newest first.
 */
const getApprovedFromList = (list) => {
  return list
    .filter((w) => w.status === 'approved')
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });
};

/**
 * Normalizes Firestore document data into a clean wish object.
 */
const formatWishDoc = (doc) => {
  const data = doc.data();
  let createdAt = data.createdAt;

  if (createdAt && typeof createdAt.toDate === 'function') {
    createdAt = createdAt.toDate().toISOString();
  } else if (!createdAt) {
    createdAt = new Date().toISOString();
  }

  return {
    id: doc.id,
    name: data.name || data.title || data.author || 'Anonymous',
    message: data.message || '',
    relation: data.relation || '',
    status: 'approved',
    createdAt,
  };
};

/**
 * SUBMISSION SERVICE
 * Submits a new wish from a visitor.
 * New submissions are automatically saved with status: 'approved' and displayed immediately.
 * 
 * If Firebase is not configured, saves to temporary session memory and notifies
 * subscribers for local preview.
 *
 * @param {Object} payload
 * @param {string} payload.name - Name of the visitor
 * @param {string} payload.message - Heartfelt message from the visitor
 * @param {string} [payload.relation] - Optional relation (e.g. "Friend", "Cousin")
 * @returns {Promise<{success: boolean, id: string, status: string, isLocalOnly: boolean, message: string}>}
 */
export async function submitWish({ name, message, relation = '' }) {
  const trimmedName = name?.trim();
  const trimmedMessage = message?.trim();
  const trimmedRelation = relation?.trim() || '';

  if (!trimmedName || !trimmedMessage) {
    throw new Error('Please provide both your name and a message.');
  }

  // 1. Production / Connected Firebase mode
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, 'wishes'), {
        name: trimmedName,
        message: trimmedMessage,
        relation: trimmedRelation,
        status: 'approved',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        id: docRef.id,
        status: 'approved',
        isLocalOnly: false,
        message: 'Your wish has been shared successfully!',
      };
    } catch (err) {
      console.error('Failed to submit wish to Firestore:', err);
      throw new Error('Could not submit wish. Please check database connection.');
    }
  }

  // 2. Development Placeholder Mode (Firebase not yet configured)
  const tempId = `temp-${Date.now()}`;
  const newLocalWish = {
    id: tempId,
    name: trimmedName,
    message: trimmedMessage,
    relation: trimmedRelation,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  localDevWishes = [newLocalWish, ...localDevWishes];
  notifyDevSubscribers();

  return {
    success: true,
    id: tempId,
    status: 'approved',
    isLocalOnly: true,
    message:
      'Your wish has been added! (Saved in local preview until Firebase is connected.)',
  };
}

/**
 * APPROVED WISHES FETCHING SERVICE
 * Fetches all approved wishes once.
 * Only wishes with status === 'approved' are returned, sorted newest first.
 *
 * @returns {Promise<Array<Object>>} Array of approved wish objects
 */
export async function fetchApprovedWishes() {
  if (isFirebaseConfigured() && db) {
    try {
      const wishesRef = collection(db, 'wishes');
      // Query for approved wishes, newest first
      const q = query(
        wishesRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(formatWishDoc);
    } catch (err) {
      // In case composite index is building or missing, fallback to filtering in memory
      console.warn('Firestore ordered query failed, trying simple query:', err);
      try {
        const wishesRef = collection(db, 'wishes');
        const fallbackQ = query(wishesRef, where('status', '==', 'approved'));
        const snapshot = await getDocs(fallbackQ);
        const results = snapshot.docs.map(formatWishDoc);
        return getApprovedFromList(results);
      } catch (fallbackErr) {
        console.error('Failed to fetch wishes from Firestore:', fallbackErr);
        throw fallbackErr;
      }
    }
  }

  // Development placeholder fallback
  return getApprovedFromList(localDevWishes);
}

/**
 * REAL-TIME FIRESTORE LISTENER
 * Subscribes to real-time updates for approved wishes.
 * Whenever a new wish is submitted or updated, this listener fires automatically.
 *
 * @param {Function} onUpdate - Callback receiving array of approved wishes (newest first)
 * @param {Function} [onError] - Optional error handler
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToApprovedWishes(onUpdate, onError) {
  if (isFirebaseConfigured() && db) {
    try {
      const wishesRef = collection(db, 'wishes');
      const q = query(
        wishesRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      let activeUnsub = null;

      activeUnsub = onSnapshot(
        q,
        (snapshot) => {
          const wishes = snapshot.docs.map(formatWishDoc);
          // Guarantee newest first ordering
          const sorted = getApprovedFromList(wishes);
          onUpdate(sorted);
        },
        (error) => {
          console.warn('Firestore real-time ordered query error, falling back:', error);
          // Fallback if index isn't ready
          const fallbackQ = query(wishesRef, where('status', '==', 'approved'));
          activeUnsub = onSnapshot(
            fallbackQ,
            (snap) => {
              const wishes = snap.docs.map(formatWishDoc);
              onUpdate(getApprovedFromList(wishes));
            },
            (err) => {
              console.error('Firestore real-time listener failed:', err);
              if (onError) onError(err);
            }
          );
        }
      );

      return () => {
        if (typeof activeUnsub === 'function') activeUnsub();
      };
    } catch (err) {
      console.error('Failed to set up Firestore listener:', err);
      if (onError) onError(err);
      return () => {};
    }
  }

  // Development placeholder listener:
  // Deliver current approved wishes immediately
  onUpdate(getApprovedFromList(localDevWishes));

  // Add to active dev subscribers
  devSubscribers.add(onUpdate);

  return () => {
    devSubscribers.delete(onUpdate);
  };
}

/**
 * Helper to check whether Firebase is live or in dev mode.
 */
export { isFirebaseConfigured };
