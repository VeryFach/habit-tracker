import { Loader2, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import {
  DeleteAccountError,
  DELETE_ERROR_MESSAGES,
  deleteAccount,
} from '../lib/delete-account';

type ModalStep = 'closed' | 'warning' | 'confirm' | 'loading';

export function DeleteAccountButton() {
  const [step, setStep] = useState<ModalStep>('closed');
  const [confirmText, setConfirmText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────

  const reset = () => {
    setStep('closed');
    setConfirmText('');
    setValidationError('');
    setErrorMessage('');
  };

  const handleContinueFromWarning = () => {
    setStep('confirm');
    setConfirmText('');
    setValidationError('');
    setErrorMessage('');
  };

  const handleConfirmDelete = async () => {
    const trimmed = confirmText.trim();
    if (trimmed !== 'DELETE') {
      setValidationError('You must type DELETE exactly to continue.');
      return;
    }

    setValidationError('');
    setStep('loading');

    try {
      await deleteAccount();
      // On success, onAuthStateChanged in App.tsx automatically
      // sets currentUser to null → <LoginScreen /> renders.
    } catch (error: unknown) {
      if (error instanceof DeleteAccountError) {
        setErrorMessage(DELETE_ERROR_MESSAGES[error.type]);
      } else {
        setErrorMessage(DELETE_ERROR_MESSAGES.unknown);
      }
      // Return to confirm step so the user can retry
      setStep('confirm');
    }
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <>
      {/* Delete Account Button */}
      <button
        onClick={() => setStep('warning')}
        disabled={step === 'loading'}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-300 bg-transparent py-4 text-brand-red transition-all hover:bg-red-50 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        <span className="text-sm font-black uppercase italic tracking-widest">
          Hapus Akun
        </span>
      </button>

      <AnimatePresence>
        {/* ── Warning Modal ──────────────────────────────────────── */}
        {step === 'warning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-brand-surface p-6 neo-shadow-lg sm:p-8"
            >
              {/* Icon */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <Trash2 className="h-7 w-7 text-brand-red" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-center text-xl font-black italic uppercase tracking-tighter text-brand-dark">
                ⚠️ Tindakan Permanen
              </h3>

              {/* Warning message */}
              <p className="mb-6 text-center text-sm leading-relaxed text-brand-muted">
                Menghapus akun akan menghapus semua progress, log, bangunan,
                kebiasaan, dan data leaderboard kamu. Tindakan ini{' '}
                <span className="font-black text-brand-red">
                  tidak dapat dibatalkan
                </span>
                .
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 rounded-2xl border-2 border-brand-border bg-brand-surface-alt py-3 font-black uppercase tracking-tight text-brand-dark transition-all hover:opacity-80 active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleContinueFromWarning}
                  className="flex-1 rounded-2xl bg-brand-red py-3 font-black uppercase tracking-tight text-white neo-shadow transition-all hover:opacity-90 active:scale-95"
                >
                  Lanjutkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── DELETE Confirmation Modal ─────────────────────────── */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-brand-surface p-6 neo-shadow-lg sm:p-8"
            >
              {/* Close button */}
              <div className="mb-4 flex justify-end">
                <button onClick={reset} className="p-1">
                  <X className="h-5 w-5 text-brand-muted" />
                </button>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-center text-lg font-black italic uppercase tracking-tighter text-brand-dark">
                Konfirmasi Penghapusan
              </h3>
              <p className="mb-5 text-center text-sm text-brand-muted">
                Ketik{' '}
                <span className="rounded-md bg-red-100 px-2 py-0.5 font-mono text-sm font-black text-brand-red">
                  DELETE
                </span>{' '}
                untuk melanjutkan.
              </p>

              {/* Text input */}
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setValidationError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmDelete();
                }}
                placeholder="Ketik DELETE di sini"
                autoFocus
                className="mb-2 w-full rounded-2xl border-2 border-brand-border bg-brand-surface-alt px-4 py-3 text-center font-mono text-lg font-black tracking-widest text-brand-dark outline-none transition-colors focus:border-brand-red"
              />

              {/* Validation / Error message */}
              {(validationError || errorMessage) && (
                <p className="mb-3 text-center text-xs font-bold text-brand-red">
                  {validationError || errorMessage}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 rounded-2xl border-2 border-brand-border bg-brand-surface-alt py-3 font-black uppercase tracking-tight text-brand-dark transition-all hover:opacity-80 active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-2xl bg-brand-red py-3 font-black uppercase tracking-tight text-white neo-shadow transition-all hover:opacity-90 active:scale-95"
                >
                  Hapus Akun
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Loading Overlay ───────────────────────────────────── */}
        {step === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Spinner */}
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-brand-red" />
              <p className="text-sm font-black uppercase tracking-widest text-white">
                Menghapus akun...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
