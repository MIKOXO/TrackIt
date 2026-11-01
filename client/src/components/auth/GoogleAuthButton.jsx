import React, { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuthButton = ({
  onSuccess,
  onError,
  promptMomentNotification,
  label = 'Continue with Google',
  isLoading = false,
  className = '',
}) => {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const promptRef = useRef(promptMomentNotification);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    promptRef.current = promptMomentNotification;
  });

  useEffect(() => {
    if (!scriptLoadedSuccessfully) return;
    const idApi = window.google?.accounts?.id;
    idApi?.initialize({
      client_id: clientId,
      use_fedcm_for_prompt: true,
      cancel_on_tap_outside: true,
      callback: (credentialResponse) => {
        if (!credentialResponse?.credential) {
          onErrorRef.current?.();
          return;
        }
        onSuccessRef.current(credentialResponse);
      },
    });
    return () => {
      idApi?.cancel?.();
    };
  }, [clientId, scriptLoadedSuccessfully]);

  const handlePrompt = () => {
    if (!scriptLoadedSuccessfully) {
      onErrorRef.current?.();
      return;
    }
    window.google?.accounts?.id?.prompt(promptRef.current);
  };

  const isBusy = isLoading || !scriptLoadedSuccessfully;

  return (
    <button
      type='button'
      onClick={handlePrompt}
      disabled={isBusy}
      aria-busy={isLoading}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/60 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_3px_8px_-2px_rgba(15,23,42,0.08)] transition-all duration-200 ease-out hover:border-emerald-400/60 hover:bg-emerald-50/70 hover:text-emerald-950 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_6px_14px_-4px_rgba(15,23,42,0.12)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_3px_8px_-2px_rgba(15,23,42,0.08)] dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:shadow-none dark:hover:border-emerald-400/40 dark:hover:bg-slate-900/90 dark:hover:text-emerald-50 dark:hover:shadow-[0_4px_16px_-4px_rgba(16,185,129,0.18)] dark:disabled:hover:shadow-none ${className}`}>
      <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200/70 dark:bg-white/10 dark:ring-white/10'>
        <FcGoogle className='h-[18px] w-[18px]' aria-hidden='true' />
      </span>
      {isBusy ? 'Connecting to Google…' : label}
    </button>
  );
};

export default GoogleAuthButton;
