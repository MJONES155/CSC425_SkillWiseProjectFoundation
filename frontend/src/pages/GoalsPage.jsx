// TODO: Implement goals management page
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [error, setError] = useState('');
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.goals.getAll();
      setGoals(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleGoalSubmit = async (formValues) => {
    try {
      setLoading(true);
      setError('');
      if (editingGoal) {
        // Update existing goal
        await apiService.goals.update(editingGoal.id, formValues);
      } else {
        // Create new goal
        await apiService.goals.create(formValues);
      }
      setShowForm(false);
      setEditingGoal(null);
      await loadGoals();
      setSuccessMessage('Goal created');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save goal');
      setSuccessMessage('Goal not created');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleMarkComplete = async (id) => {
    try {
      setLoading(true);
      setError('');
      await apiService.goals.update(id, {
        isCompleted: true,
        progressPercentage: 100,
      });
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark goal complete');
    } finally {
      setLoading(false);
    }
  };

  // "Pause" goal workaround: set difficulty to 'paused'
  const handlePause = async (id) => {
    try {
      setLoading(true);
      setError('');
      await apiService.goals.update(id, { difficulty: 'paused' });
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to pause goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError('');
      await apiService.goals.delete(id);
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (challengeId) => {
    try {
      setError('');
      await apiService.challenges.complete(challengeId);
      // Reload goals to update progress
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete challenge');
    }
  };

  // Filter goals based on current filters
  useEffect(() => {
    let filtered = goals;

    if (filters.category) {
      filtered = filtered.filter(
        (goal) => goal.category.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (goal) =>
          goal.difficulty.toLowerCase() === filters.difficulty.toLowerCase(),
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (goal) =>
          goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (goal.description &&
            goal.description
              .toLowerCase()
              .includes(filters.search.toLowerCase())),
      );
    }

    setFilteredGoals(filtered);
  }, [goals, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // TODO: Add goal creation, filtering, search, sorting
  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>My Learning Goals</h1>
        <button className="btn-primary" onClick={handleCreateGoal} data-test="create-goal-button">
          Create New Goal
        </button>
      </div>

      {/* TODO: Add filters for category, status, difficulty */}

      <div className="goals-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="search">Search Goals</label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, or tags..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              data-test="search-goals"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              data-test="goal-filter-category"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              data-test="goal-filter-difficulty"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="results-summary">
          <p>
            Showing {filteredGoals.length} of {goals.length} goals
          </p>
        </div>
      </div>

      <div className="goals-content">
        {loading ? (
          <LoadingSpinner message="Loading goals..." />
        ) : filteredGoals.length > 0 ? (
          <div className="goals-grid">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkComplete={handleMarkComplete}
                onPause={handlePause}
                onChallengeComplete={handleChallengeComplete}
                data-test={`goal-card-${goal.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No goals found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button
              className="btn-secondary"
              data-test="clear-goal-filters"
              onClick={() =>
                setFilters({ category: '', difficulty: '', search: '' })
              }
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {successMessage && <div data-test="goal-success-message">{successMessage}</div>}

      {showForm && (
        <GoalForm
          onSubmit={handleGoalSubmit}
          onClose={handleFormClose}
          initialGoal={editingGoal}
        />
      )}
    </div>
  );
};

export default GoalsPage;
