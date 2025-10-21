import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  // Get error information from router state or props
  const error = new Error('Something went wrong');
  const resetError = () => {
    // This would typically reset error boundary state
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h1>Oops! Something went wrong</h1>
          <p>
            We're sorry, but something unexpected happened. 
            Our team has been notified and is working to fix the issue.
          </p>
          
          <div className="error-details">
            <details>
              <summary>Technical Details</summary>
              <div className="error-message">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="error-stack">
                <strong>Stack Trace:</strong>
                <pre>{error.stack}</pre>
              </div>
            </details>
          </div>
          
          <div className="error-actions">
            <button onClick={resetError} className="btn-primary">
              Try Again
            </button>
            <Link to="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
          
          <div className="error-suggestions">
            <h3>What you can try:</h3>
            <ul>
              <li>Refresh the page</li>
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
            </ul>
          </div>
        </div>
        
        <div className="error-illustration">
          <div className="broken-robot">🤖💥</div>
          <div className="error-message-bubble">
            "Don't worry, I'll be back up and running soon!"
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;