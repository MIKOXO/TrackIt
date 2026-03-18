import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const SecurityGate = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (user && !user.securityQuestionSet && location.pathname !== '/security-question') {
    return <Navigate to="/security-question" replace />;
  }

  return children;
};

export default SecurityGate;
