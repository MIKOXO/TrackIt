import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const AuthLoadingIndicator = () => {
  const reduceMotion = useReducedMotion();

  return (
    <span className='inline-flex h-4 items-center gap-1' aria-hidden='true'>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className='h-1.5 w-1.5 rounded-full bg-current'
          animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={reduceMotion ? undefined : { duration: 0.9, repeat: Infinity, delay: dot * 0.14, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
};

export default AuthLoadingIndicator;
