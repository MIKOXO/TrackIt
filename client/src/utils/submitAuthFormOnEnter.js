const submitAuthFormOnEnter = (event) => {
  if (event.key !== 'Enter' || event.nativeEvent?.isComposing || !event.target.matches('input')) return;

  const submitButton = event.currentTarget.querySelector('button[type="submit"]:not(:disabled)');
  if (!submitButton) return;

  event.preventDefault();
  event.currentTarget.requestSubmit(submitButton);
};

export default submitAuthFormOnEnter;
