import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import './ChallengeForm.css';

const ChallengeForm = ({ onSubmit, onClose, initialChallenge = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: '',
    difficulty: 'Medium',
    estimatedTimeMinutes: 30,
    pointsReward: 10,
    maxAttempts: 3,
    goalId: '', // optional linkage
    prerequisites: [], // array of challenge IDs
  });

  const [goals, setGoals] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [prereqWarning, setPrereqWarning] = useState('');

  useEffect(() => {
    if (initialChallenge) {
      setFormData({
        title: initialChallenge.title || '',
        description: initialChallenge.description || '',
        instructions: initialChallenge.instructions || '',
        category: initialChallenge.category || '',
        difficulty: initialChallenge.difficulty || 'Medium',
        estimatedTimeMinutes: initialChallenge.estimatedTimeMinutes || 30,
        pointsReward: initialChallenge.pointsReward || 10,
        maxAttempts: initialChallenge.maxAttempts || 3,
        goalId: initialChallenge.goalId || '',
        prerequisites: Array.isArray(initialChallenge.prerequisites)
          ? initialChallenge.prerequisites.map((id) => parseInt(id, 10))
          : [],
      });
    }
  }, [initialChallenge]);

  // Load user's goals and challenges for selection
  useEffect(() => {
    const load = async () => {
      try {
        const [goalsRes, challengesRes] = await Promise.all([
          apiService.goals.getAll(),
          apiService.challenges.getAll(),
        ]);
        setGoals(goalsRes.data?.data ?? goalsRes.data ?? []);
        setAllChallenges(challengesRes.data?.data ?? challengesRes.data ?? []);
      } catch (e) {
        console.warn('Failed to load selectable goals/challenges');
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue;

    if (type === 'number') {
      processedValue = value === '' ? null : parseInt(value, 10);
    } else if (name === 'goalId') {
      // When goal changes, drop prerequisites that don't match the selected goal
      const newGoalId = value ? parseInt(value, 10) : '';
      let newPrereqs = formData.prerequisites;
      if (newGoalId && Array.isArray(newPrereqs) && newPrereqs.length) {
        const allowedIds = new Set(
          allChallenges.filter((c) => c.goalId === newGoalId).map((c) => c.id)
        );
        const removed = newPrereqs.filter((id) => !allowedIds.has(id));
        newPrereqs = newPrereqs.filter((id) => allowedIds.has(id));
        if (removed.length) {
          setPrereqWarning(
            `Removed ${removed.length} prerequisite(s) not linked to the selected goal.`
          );
          setTimeout(() => setPrereqWarning(''), 4000);
        }
      }
      setFormData((prev) => ({ ...prev, prerequisites: newPrereqs }));
      processedValue = newGoalId;
    } else {
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Add a prerequisite from the dropdown
  const handleAddPrerequisite = (e) => {
    const challengeId = parseInt(e.target.value, 10);
    if (challengeId && !formData.prerequisites.includes(challengeId)) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, challengeId],
      }));
    }
    e.target.value = ''; // Reset dropdown
  };

  // Remove a prerequisite
  const handleRemovePrerequisite = (challengeId) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((id) => id !== challengeId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      goalId: formData.goalId ? parseInt(formData.goalId, 10) : undefined,
      prerequisites: Array.isArray(formData.prerequisites)
        ? formData.prerequisites
        : [],
    };
    // Front-end guard: if goal selected, ensure all prereqs belong to same goal
    if (payload.goalId) {
      const mismatched = payload.prerequisites.filter((id) => {
        const ch = allChallenges.find((c) => c.id === id);
        return ch && ch.goalId !== payload.goalId;
      });
      if (mismatched.length) {
        setPrereqWarning(
          'Some prerequisites belong to a different goal. Please fix and try again.'
        );
        return;
      }
    }
    onSubmit(payload);
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
              <label htmlFor="goalId">Link to Goal (optional)</label>
              <select
                id="goalId"
                name="goalId"
                value={formData.goalId}
                onChange={handleChange}
              >
                <option value="">No goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
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

          <div className="form-group">
            <label htmlFor="prerequisite-select">Prerequisite Challenges</label>
            {formData.prerequisites.length > 0 && (
              <div className="prerequisite-tags">
                {formData.prerequisites.map((prereqId) => {
                  const challenge = allChallenges.find(
                    (c) => c.id === prereqId
                  );
                  return (
                    <div key={prereqId} className="prerequisite-tag">
                      <span>
                        {challenge ? challenge.title : `Challenge #${prereqId}`}
                      </span>
                      <button
                        type="button"
                        className="remove-tag-btn"
                        onClick={() => handleRemovePrerequisite(prereqId)}
                        aria-label="Remove prerequisite"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <select
              id="prerequisite-select"
              onChange={handleAddPrerequisite}
              defaultValue=""
            >
              <option value="">+ Add prerequisite challenge</option>
              {(formData.goalId
                ? allChallenges.filter(
                    (c) => c.goalId === parseInt(formData.goalId, 10)
                  )
                : allChallenges
              )
                .filter(
                  (c) => !initialChallenge || c.id !== initialChallenge.id
                )
                .filter((c) => !formData.prerequisites.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}{' '}
                    {c.status ? `(${c.status.replace('_', ' ')})` : ''}
                  </option>
                ))}
            </select>
            {prereqWarning && (
              <div className="warning-text" role="alert">
                {prereqWarning}
              </div>
            )}
            <small className="help-text">
              Learners must complete selected challenges before this one can be
              marked completed.
            </small>
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
