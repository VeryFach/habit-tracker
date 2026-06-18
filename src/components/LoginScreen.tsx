import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';

export function LoginScreen() {
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tidak bisa membuka login Google.';

      if (message.includes('auth/unauthorized-domain')) {
        setAuthError('Domain ini belum diizinkan di Firebase Auth. Tambahkan localhost ke Authorized domains.');
        return;
      }

      setAuthError('Login gagal. Coba lagi atau cek konfigurasi Firebase.');
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md sm:max-w-lg w-full"
      >
        <div className="mb-8 relative inline-block">
           <div className="w-24 h-24 bg-brand-teal rounded-[2rem] border-2 border-gray-200 neo-shadow-lg flex items-center justify-center text-4xl transform -rotate-6">
              🏰
           </div>
           <div className="absolute -top-4 -right-4 bg-brand-yellow p-2 rounded-xl border border-gray-200 neo-shadow-sm animate-bounce">
              <Sparkles className="w-6 h-6 text-brand-dark" />
           </div>
        </div>

        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 text-brand-dark">
          HABI<span className="text-brand-teal">TORIA</span>
        </h1>
        <p className="text-brand-dark/40 font-black uppercase text-xs tracking-[0.3em] mb-12">
          Sync your productivity with the simulation
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-brand-dark text-white font-black py-6 rounded-3xl neo-shadow-lg hover:bg-brand-dark/90 active:scale-95 transition-all flex items-center justify-center gap-4 text-xl italic uppercase tracking-tighter"
          >
            <LogIn className="w-6 h-6" />
            Sign in with Google
          </button>

          {authError && (
            <p className="text-xs font-bold text-brand-red uppercase tracking-wider leading-relaxed px-4">
              {authError}
            </p>
          )}
          
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-8">
            Your data is stored securely in the cloud via Firebase.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
