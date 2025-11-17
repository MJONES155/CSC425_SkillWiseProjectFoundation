import React, { useState, useEffect } from 'react';
import './GoalForm.css';

// Props:
// - onSubmit(formData)
// - onClose()
// - initialGoal (optional) for edit mode
const GoalForm = ({ onSubmit, onClose, initialGoal }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Medium',
    targetCompletionDate: '', // YYYY-MM-DD
  });

  useEffect(() => {
    if (initialGoal) {
      setFormData({
        title: initialGoal.title || '',
        description: initialGoal.description || '',
        category: initialGoal.category || '',
        difficulty: initialGoal.difficulty || 'Medium',
        // Convert ISO date to YYYY-MM-DD for input[type=date]
        targetCompletionDate: initialGoal.targetCompletionDate
          ? new Date(initialGoal.targetCompletionDate)
              .toISOString()
              .slice(0, 10)
          : '',
      });
    }
  }, [initialGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }
  };

  return (
    <div className="goal-form-overlay">
      <div className="goal-form-modal">
        <div className="modal-header">
          <h2>{initialGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Goal Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select a category</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetCompletionDate">Target Date</label>
            <input
              type="date"
              id="targetCompletionDate"
              value={formData.targetCompletionDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetCompletionDate: e.target.value,
                })
              }
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
