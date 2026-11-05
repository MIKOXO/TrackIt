import React, { useEffect, useRef, useState } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const GSI_MIN_WIDTH = 200;
const GSI_MAX_WIDTH = 400;

const GoogleAuthButton = ({
  onSuccess,
  onError,
  label = 'Continue with Google',
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const wrapperRef = useRef(null);
  const hostRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return undefined;
    let frame = 0;
    const applyWidth = () => {
      const next = node.clientWidth;
      if (next > 0) setWidth((value) => (Math.abs(next - value) > 2 ? next : value));
    };
    applyWidth();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(applyWidth);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const widthKey = width ? Math.round(width / 4) : 0;

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !widthKey || !hostRef.current) return undefined;
    const idApi = window.google?.accounts?.id;
    if (!idApi) return undefined;

    const currentHost = hostRef.current;
    idApi.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        if (!credentialResponse?.credential) {
          onErrorRef.current?.();
          return;
        }
        onSuccessRef.current(credentialResponse);
      },
    });

    currentHost.replaceChildren();
    idApi.renderButton(currentHost, {
      type: 'standard',
      size: 'large',
      theme: 'filled_black',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'center',
      width: Math.min(Math.max(width, GSI_MIN_WIDTH), GSI_MAX_WIDTH),
    });

    return () => {
      currentHost.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, scriptLoadedSuccessfully, widthKey]);

  const isBusy = isLoading || !scriptLoadedSuccessfully;

  const stateClasses =
    isHovered && !isBusy && !disabled
      ? 'border-emerald-400/60 bg-emerald-50/70 text-emerald-950 shadow-[0_2px_4px_rgba(15,23,42,0.05),0_6px_14px_-4px_rgba(15,23,42,0.12)] dark:border-emerald-400/40 dark:bg-slate-900/90 dark:text-emerald-50 dark:shadow-[0_4px_16px_-4px_rgba(16,185,129,0.18)]'
      : 'border-slate-200/60 bg-white/80 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_3px_8px_-2px_rgba(15,23,42,0.08)] dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:shadow-none';

  const surfaceClasses = [
    'pointer-events-none relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-xl border px-5 text-sm font-semibold transition-all duration-200 ease-out',
    stateClasses,
    isPressed && !isBusy && !disabled ? 'scale-[0.98]' : 'scale-100',
    isFocused ? 'ring-4 ring-emerald-500/20' : 'outline-none',
    isBusy || disabled ? 'cursor-not-allowed opacity-60' : 'opacity-100',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const targetWidth = Math.min(Math.max(width, GSI_MIN_WIDTH), GSI_MAX_WIDTH);
  const scaleX = width ? width / targetWidth : 1;
  const scaleY = 44 / 40;

  return (
    <div
      ref={wrapperRef}
      role='presentation'
      className={`relative h-[44px] w-full select-none ${disabled || isBusy ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      aria-disabled={disabled || isBusy}
      aria-busy={isBusy}>
      {/* Single invisible official GSI button, stretched to cover the full surface */}
      <div
        ref={hostRef}
        className='absolute inset-0 overflow-hidden opacity-0 [&_iframe]:origin-top-left [&_iframe]:cursor-pointer [&_iframe]:border-0 [&_iframe]:[transform:scale(var(--gsi-scale-x),_var(--gsi-scale-y))]'
        style={{
          '--gsi-scale-x': scaleX.toFixed(4),
          '--gsi-scale-y': scaleY.toFixed(4),
          pointerEvents: isBusy || disabled ? 'none' : 'auto',
        }}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
      />
      {/* Themed visuals shown on top, styled like before */}
      <div aria-hidden className={surfaceClasses}>
        <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200/70 dark:bg-white/10 dark:ring-white/10'>
          <FcGoogle className='h-[18px] w-[18px]' />
        </span>
        {isBusy ? 'Connecting to Google…' : label}
      </div>
    </div>
  );
};

export default GoogleAuthButton;
