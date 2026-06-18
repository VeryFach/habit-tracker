import {
  GoogleAuthProvider,
  reauthenticateWithCredential,
  signInWithPopup,
  deleteUser,
  signOut,
} from 'firebase/auth';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Error Classification ─────────────────────────────────────────────

export type DeleteAccountErrorType =
  | 'no_user'
  | 'cancelled'
  | 'reauth_failed'
  | 'firestore_failed'
  | 'auth_failed'
  | 'unknown';

export class DeleteAccountError extends Error {
  type: DeleteAccountErrorType;

  constructor(type: DeleteAccountErrorType, message: string) {
    super(message);
    this.name = 'DeleteAccountError';
    this.type = type;
  }
}

// ─── Friendly Error Messages (UI-facing) ──────────────────────────────

export const DELETE_ERROR_MESSAGES: Record<DeleteAccountErrorType, string> = {
  no_user: 'No authenticated user found.',
  cancelled: 'Reauthentication was cancelled.',
  reauth_failed: 'Could not verify your identity.',
  firestore_failed: 'Failed to delete your data.',
  auth_failed: 'Failed to delete your account.',
  unknown: 'Something went wrong while deleting your account.',
};

// ─── Firestore Subcollections to Delete ───────────────────────────────

const SUBCOLLECTIONS = ['logs', 'habits', 'buildings'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Delete all documents inside a named subcollection of the user doc.
 * Uses batched writes (max 500 per batch) for atomicity and throughput.
 * Logs warnings on partial failures but never throws — best-effort cleanup.
 */
async function deleteSubcollection(uid: string, subName: string): Promise<void> {
  try {
    const colRef = collection(db, 'users', uid, subName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return;

    // Firestore batches are limited to 500 writes
    const BATCH_SIZE = 450;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + BATCH_SIZE);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error) {
    console.warn(`[delete-account] Failed to delete subcollection "${subName}":`, error);
  }
}

// ─── Main Flow ────────────────────────────────────────────────────────

/**
 * Full account deletion flow:
 *   1. Reauthenticate via Google popup
 *   2. Delete Firestore subcollections (logs, habits, buildings)
 *   3. Delete root user document  (users/{uid})
 *   4. Delete leaderboard document (leaderboard/{uid})
 *   5. Delete Firebase Auth account
 *   6. Sign out (cleanup)
 *
 * onAuthStateChanged in App.tsx handles the redirect to LoginScreen
 * automatically when currentUser becomes null.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new DeleteAccountError('no_user', 'No authenticated user found');
  }

  const uid = user.uid;

  // ── Step 1: Reauthenticate ───────────────────────────────────────
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential) {
      throw new DeleteAccountError('reauth_failed', 'Failed to get Google credential');
    }

    await reauthenticateWithCredential(user, credential);
  } catch (error: unknown) {
    if (error instanceof DeleteAccountError) throw error;

    // Firebase error codes for popup interactions
    const code = (error as { code?: string })?.code ?? '';

    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      throw new DeleteAccountError('cancelled', 'Reauthentication was cancelled.');
    }

    throw new DeleteAccountError('reauth_failed', 'Could not verify your identity.');
  }

  // ── Step 2: Delete Firestore subcollections ──────────────────────
  await Promise.all(
    SUBCOLLECTIONS.map((sub) => deleteSubcollection(uid, sub)),
  );

  // ── Step 3: Delete root user document ────────────────────────────
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('[delete-account] Failed to delete root user doc:', error);
    throw new DeleteAccountError('firestore_failed', 'Failed to delete user document.');
  }

  // ── Step 4: Delete leaderboard document ──────────────────────────
  try {
    await deleteDoc(doc(db, 'leaderboard', uid));
  } catch (error) {
    console.warn('[delete-account] Failed to delete leaderboard doc (non-fatal):', error);
  }

  // ── Step 5: Delete Auth account ──────────────────────────────────
  try {
    await deleteUser(user);
  } catch (error) {
    console.error('[delete-account] Failed to delete auth account:', error);
    throw new DeleteAccountError('auth_failed', 'Failed to delete your account.');
  }

  // ── Step 6: Sign out ─────────────────────────────────────────────
  // After deleteUser the auth state is already cleared, but signOut ensures
  // a clean session teardown. onAuthStateChanged handles the UI redirect.
  try {
    await signOut(auth);
  } catch {
    // Expected: user already deleted, signOut is best-effort
  }
}
