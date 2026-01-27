'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const { user, userProfile, sendVerificationEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no hay usuario o ya está verificado, redirigir
    if (!user) {
      router.push('/login');
    } else if (user.emailVerified) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleResendEmail = async () => {
    setMessage('');
    setSending(true);

    try {
      await sendVerificationEmail();
      setMessage('¡Email de verificación enviado! Revisa tu bandeja de entrada.');
    } catch (err: any) {
      setMessage(err.message || 'Error al enviar email de verificación');
    } finally {
      setSending(false);
    }
  };

  const handleContinue = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Diario de un Instante
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verifica tu email
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hemos enviado un email de verificación a:
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {user?.email}
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Haz clic en el enlace del email para verificar tu cuenta. Si no lo recibes en unos minutos, revisa tu carpeta de spam.
            </p>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('enviado')
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  message.includes('enviado')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={sending}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Enviando...' : 'Reenviar email de verificación'}
              </button>

              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continuar (verificaré después)
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Link href="/logout" className="text-violet-600 hover:text-violet-700 font-medium">
                  Cerrar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
