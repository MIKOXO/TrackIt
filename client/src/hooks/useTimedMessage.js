import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTH_FEEDBACK_TIMEOUTS } from '../constants/authFeedback.js';

const useTimedMessage = (timeout = 0) => {
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState('error');
  const [paused, setPaused] = useState(false);
  const [messageTimeout, setMessageTimeout] = useState(timeout);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (!message || paused) {
      return undefined;
    }
    if (!messageTimeout) {
      return undefined;
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setMessage(null);
      setVariant('error');
    }, messageTimeout);
    return () => clearTimer();
  }, [message, paused, messageTimeout, clearTimer]);

  const show = useCallback((nextMessage, nextVariant = 'error', nextTimeout) => {
    setPaused(false);
    setMessage(nextMessage);
    setVariant(nextVariant);
    setMessageTimeout(nextTimeout ?? (nextVariant === 'error' ? timeout : AUTH_FEEDBACK_TIMEOUTS.blockSuccess));
  }, [timeout]);

  const clear = useCallback(() => {
    setMessage(null);
    setVariant('error');
    setMessageTimeout(timeout);
  }, [timeout]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const visible = message !== null;

  return { message, variant, visible, show, clear, pause, resume };
};

export default useTimedMessage;
export { useTimedMessage };
