import React, { useState, useEffect } from 'react';

// Props:
// - onSubmit(formData)
// - onClose()
// - initialGoal (optional) for edit mode
const GoalForm = ({ onSubmit, onClose, initialGoal }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    targetCompletionDate: '', // YYYY-MM-DD
  });

  useEffect(() => {
    if (initialGoal) {
      setFormData({
        title: initialGoal.title || '',
        description: initialGoal.description || '',
        category: initialGoal.category || '',
        difficulty: initialGoal.difficulty || 'medium',
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
    <form onSubmit={handleSubmit} className="goal-form">
      <div className="form-group">
        <label htmlFor="title">Goal Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
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
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="targetCompletionDate">Target Date</label>
        <input
          type="date"
          id="targetCompletionDate"
          value={formData.targetCompletionDate}
          onChange={(e) =>
            setFormData({ ...formData, targetCompletionDate: e.target.value })
          }
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Save Goal
        </button>
        {typeof onClose === 'function' && (
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GoalForm;
