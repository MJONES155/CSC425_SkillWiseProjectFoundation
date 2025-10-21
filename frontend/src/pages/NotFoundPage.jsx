import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>
            Oops! The page you're looking for doesn't exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Go to Dashboard
            </Link>
          </div>
          
          <div className="helpful-links">
            <h3>Maybe you're looking for:</h3>
            <ul>
              <li><Link to="/challenges">Browse Challenges</Link></li>
              <li><Link to="/goals">View Your Goals</Link></li>
              <li><Link to="/progress">Check Progress</Link></li>
              <li><Link to="/leaderboard">See Leaderboard</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="not-found-illustration">
          <div className="illustration-content">
            <div className="lost-robot">🤖</div>
            <div className="speech-bubble">
              "I've searched everywhere, but I can't find that page!"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;