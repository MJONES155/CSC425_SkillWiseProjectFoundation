import React, { useState, useEffect } from 'react';

const ChallengeForm = ({ onSubmit, onClose, initialChallenge = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: '',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    pointsReward: 10,
    maxAttempts: 3,
  });

  useEffect(() => {
    if (initialChallenge) {
      setFormData({
        title: initialChallenge.title || '',
        description: initialChallenge.description || '',
        instructions: initialChallenge.instructions || '',
        category: initialChallenge.category || '',
        difficulty: initialChallenge.difficulty || 'medium',
        estimatedTimeMinutes: initialChallenge.estimatedTimeMinutes || 30,
        pointsReward: initialChallenge.pointsReward || 10,
        maxAttempts: initialChallenge.maxAttempts || 3,
      });
    }
  }, [initialChallenge]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue;

    if (type === 'number') {
      processedValue = value === '' ? null : parseInt(value, 10);
    } else {
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="challenge-form-overlay">
      <div className="challenge-form-modal">
        <div className="modal-header">
          <h2>
            {initialChallenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions *</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="backend">Backend</option>
                <option value="data-science">Data Science</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedTimeMinutes">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                id="estimatedTimeMinutes"
                name="estimatedTimeMinutes"
                value={formData.estimatedTimeMinutes || ''}
                onChange={handleChange}
                min={1}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pointsReward">Points Reward</label>
              <input
                type="number"
                id="pointsReward"
                name="pointsReward"
                value={formData.pointsReward || ''}
                onChange={handleChange}
                min={1}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxAttempts">Max Attempts</label>
              <input
                type="number"
                id="maxAttempts"
                name="maxAttempts"
                value={formData.maxAttempts || ''}
                onChange={handleChange}
                min={1}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialChallenge ? 'Update Challenge' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;
