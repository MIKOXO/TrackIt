import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../../components/ui/LoadingIndicator.jsx';
import { setUser, setLoading, setError } from '../../store/slices/authSlice';
import { setSecurityQuestion as submitSecurityQuestion } from '../../services/authService.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import { getServerMessage } from '../../utils/errorUtils.js';
import { getPrimaryButtonClass } from '../../components/ui/buttonStyles.js';
import { SECURITY_QUESTIONS } from '../../constants/securityQuestions';

const SecurityQuestion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedAnswer = answer.trim();
  const isReady = Boolean(trimmedAnswer);
  const isButtonDisabled = !isReady || isSubmitting;

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      showToast('Authentication is required to continue.', { type: 'error' });
      return;
    }
    if (!isReady) {
      showToast('Answer cannot be blank.', { type: 'error' });
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    setIsSubmitting(true);

    try {
      const response = await submitSecurityQuestion(
        { question: selectedQuestion, answer: trimmedAnswer },
        token,
      );

      dispatch(setUser({ user: response.data.user, token }));
      showToast('Security question saved. You are all set!', { type: 'success' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = getServerMessage(err, 'Unable to save security question right now.');
      dispatch(setError(message));
      showToast(message, { type: 'error' });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/90 dark:text-emerald-300/90">
          Secure access
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          {user?.name ? `Hi ${user.name.split(' ')[0]},` : 'Protect your account'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Select a security question and provide an answer that only you will remember. This will
          allow you to recover your password in the future.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-trackit-border/80 dark:bg-slate-900/80">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Choose a security question
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECURITY_QUESTIONS.map((question) => {
                const isActive = selectedQuestion === question;
                return (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleQuestionClick(question)}
                    className={
                      `w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/80 dark:bg-emerald-500/10 dark:text-emerald-200'
                          : 'border-slate-200/70 bg-slate-50 text-slate-700 dark:border-trackit-border/70 dark:bg-slate-900/60 dark:text-slate-200'
                      }`
                    }
                  >
                    {isActive ? '✓ ' : ''}
                    {question}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Your answer
            </label>
            <input
              type="text"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Enter your secret answer"
              className="w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We encrypt this answer; it is never returned in plain text.
            </p>
          </div>

          <button
            type="submit"
            disabled={isButtonDisabled}
            className={getPrimaryButtonClass(isButtonDisabled)}
          >
            {isSubmitting && (
              <span className="mr-3">
                <LoadingIndicator />
              </span>
            )}
            {isSubmitting ? 'Saving...' : 'Save security question'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default SecurityQuestion;
