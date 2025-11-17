// TODO: Implement challenges browsing and participation page
import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeForm from '../components/challenges/ChallengeForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.challenges.getAll();
      const challengesData = res.data?.data ?? res.data ?? [];
      setChallenges(challengesData);
      setFilteredChallenges(challengesData);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load challenges.');
      console.error('Error loading challenges:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  // Filter challenges based on current filters
  useEffect(() => {
    let filtered = challenges;

    if (filters.category) {
      filtered = filtered.filter(
        (challenge) =>
          challenge.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (challenge) =>
          challenge.difficulty?.toLowerCase() ===
          filters.difficulty.toLowerCase()
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (challenge) =>
          challenge.title
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          challenge.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          challenge.tags?.some((tag) =>
            tag.toLowerCase().includes(filters.search.toLowerCase())
          )
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setShowForm(true);
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setShowForm(true);
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await apiService.challenges.delete(challengeId);
        await loadChallenges();
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to delete challenge.');
        console.error('Error deleting challenge:', e);
      }
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      setError('');
      await apiService.challenges.complete(challengeId);
      await loadChallenges();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete challenge.');
      console.error('Error completing challenge:', e);
    }
  };

  const handleChallengeSubmit = async (challengeData) => {
    try {
      setError('');
      if (editingChallenge) {
        await apiService.challenges.update(editingChallenge.id, challengeData);
      } else {
        await apiService.challenges.create(challengeData);
      }
      setShowForm(false);
      setEditingChallenge(null);
      await loadChallenges();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save challenge.');
      console.error('Error saving challenge:', e);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingChallenge(null);
  };

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>Learning Challenges</h1>
        <p>Enhance your skills with hands-on learning experiences</p>
        <button className="btn-primary" onClick={handleCreateChallenge}>
          Create New Challenge
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="challenges-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="search">Search Challenges</label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, or tags..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="backend">Backend</option>
              <option value="data-science">Data Science</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
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
            Showing {filteredChallenges.length} of {challenges.length}{' '}
            challenges
          </p>
        </div>
      </div>

      <div className="challenges-content">
        {loading ? (
          <LoadingSpinner message="Loading challenges..." />
        ) : filteredChallenges.length > 0 ? (
          <div className="challenges-grid">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
                onComplete={handleCompleteChallenge}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No challenges found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button
              className="btn-secondary"
              onClick={() =>
                setFilters({ category: '', difficulty: '', search: '' })
              }
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <ChallengeForm
          onSubmit={handleChallengeSubmit}
          onClose={handleCloseForm}
          initialChallenge={editingChallenge}
        />
      )}
    </div>
  );
};

export default ChallengesPage;
