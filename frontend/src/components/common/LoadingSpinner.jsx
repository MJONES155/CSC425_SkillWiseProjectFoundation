// TODO: Implement loading spinner component
import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  // TODO: Add different spinner sizes and animations
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;