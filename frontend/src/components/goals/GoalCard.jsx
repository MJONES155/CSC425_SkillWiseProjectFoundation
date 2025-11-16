// TODO: Implement goal card component
import React from 'react';

const GoalCard = ({ goal, onEdit, onDelete }) => {
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
              style={{ width: `${goal?.progressPercentage || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {goal?.progressPercentage || 0}%
          </span>
        </div>
      </div>

      <div className="goal-footer">
        <span className="goal-difficulty">{goal?.difficulty || 'medium'}</span>
        {goal?.targetCompletionDate && (
          <span className="goal-date">
            Due: {new Date(goal.targetCompletionDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="goal-actions">
        {onEdit && (
          <button className="btn-secondary" onClick={() => onEdit(goal)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn-danger" onClick={() => onDelete(goal.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
