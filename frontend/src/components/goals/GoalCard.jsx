// TODO: Implement goal card component
import React from 'react';

const GoalCard = ({ goal }) => {
  // TODO: Add progress bar, completion status, actions
  return (
    <div className="goal-card">
      <div className="goal-header">
        <h3>{goal?.title || 'Goal Title'}</h3>
        <span className="goal-category">{goal?.category || 'Category'}</span>
      </div>
      
      <div className="goal-content">
        <p>{goal?.description || 'Goal description goes here...'}</p>
        
        <div className="goal-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${goal?.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{goal?.progress || 0}%</span>
        </div>
      </div>

      <div className="goal-footer">
        <span className="goal-difficulty">{goal?.difficulty || 'Medium'}</span>
        {goal?.targetDate && (
          <span className="goal-date">Due: {goal.targetDate}</span>
        )}
      </div>
    </div>
  );
};

export default GoalCard;