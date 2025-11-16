// TODO: Implement challenge card component
import React from 'react';

const ChallengeCard = ({ challenge, onEdit, onDelete, onStart }) => {
  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <h3>{challenge?.title || 'Challenge Title'}</h3>
        <div className="challenge-meta">
          <span
            className={`difficulty difficulty-${
              challenge?.difficulty?.toLowerCase() || 'medium'
            }`}
          >
            {challenge?.difficulty || 'Medium'}
          </span>
          <span className="points">+{challenge?.pointsReward || 10} pts</span>
        </div>
      </div>

      <div className="challenge-content">
        <p className="description">
          {challenge?.description || 'Challenge description goes here...'}
        </p>

        {challenge?.instructions && (
          <div className="instructions">
            <strong>Instructions:</strong>
            <p>{challenge.instructions}</p>
          </div>
        )}

        {challenge?.category && (
          <div className="category">
            <span>📁 {challenge.category}</span>
          </div>
        )}

        {challenge?.estimatedTimeMinutes && (
          <div className="estimated-time">
            <span>⏱️ {challenge.estimatedTimeMinutes} min</span>
          </div>
        )}

        {challenge?.maxAttempts && (
          <div className="max-attempts">
            <span>🎯 Max attempts: {challenge.maxAttempts}</span>
          </div>
        )}
      </div>

      <div className="challenge-footer">
        {onStart && (
          <button className="btn-primary" onClick={() => onStart(challenge)}>
            Start Challenge
          </button>
        )}
        {onEdit && (
          <button className="btn-secondary" onClick={() => onEdit(challenge)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn-danger" onClick={() => onDelete(challenge.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
