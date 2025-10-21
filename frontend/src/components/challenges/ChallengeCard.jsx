// TODO: Implement challenge card component
import React from 'react';

const ChallengeCard = ({ challenge }) => {
  // TODO: Add difficulty indicators, estimated time, tags, actions
  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <h3>{challenge?.title || 'Challenge Title'}</h3>
        <div className="challenge-meta">
          <span className="difficulty">{challenge?.difficulty || 'Medium'}</span>
          <span className="points">+{challenge?.points || 10} pts</span>
        </div>
      </div>
      
      <div className="challenge-content">
        <p>{challenge?.description || 'Challenge description goes here...'}</p>
        
        {challenge?.estimatedTime && (
          <div className="estimated-time">
            <span>⏱️ {challenge.estimatedTime} min</span>
          </div>
        )}
        
        {challenge?.tags && (
          <div className="challenge-tags">
            {challenge.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="challenge-footer">
        <button className="btn-primary">Start Challenge</button>
      </div>
    </div>
  );
};

export default ChallengeCard;