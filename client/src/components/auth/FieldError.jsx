import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';

const FieldError = ({ id, message, visible = false }) => {
  const reduceMotion = useReducedMotion();
  return <div id={id} className='mt-1.5'>
    <AnimatePresence>
      {visible ? (
        <motion.div
          key='field-error'
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          className='overflow-hidden'>
          <p
            role='alert'
            className='flex items-start gap-1.5 text-xs font-medium leading-5 text-rose-600 dark:text-rose-400'>
            <FiAlertCircle className='mt-0.5 h-3 w-3 shrink-0' aria-hidden='true' />
            <span>{message}</span>
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
};

export default FieldError;
