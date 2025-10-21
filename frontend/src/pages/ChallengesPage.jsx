// TODO: Implement challenges browsing and participation page
import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: 'Build a React Component',
        description: 'Create a reusable React component with props and state management.',
        category: 'Programming',
        difficulty: 'Medium',
        points: 50,
        estimatedTime: 45,
        tags: ['React', 'JavaScript', 'Frontend']
      },
      {
        id: 2,
        title: 'Design a Logo',
        description: 'Design a professional logo using design principles and color theory.',
        category: 'Design',
        difficulty: 'Easy',
        points: 30,
        estimatedTime: 60,
        tags: ['Design', 'Branding', 'Creative']
      },
      {
        id: 3,
        title: 'Database Optimization',
        description: 'Optimize a slow database query and improve performance metrics.',
        category: 'Backend',
        difficulty: 'Hard',
        points: 100,
        estimatedTime: 120,
        tags: ['SQL', 'Database', 'Performance']
      }
    ];

    setTimeout(() => {
      setChallenges(mockChallenges);
      setFilteredChallenges(mockChallenges);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter challenges based on current filters
  useEffect(() => {
    let filtered = challenges;

    if (filters.category) {
      filtered = filtered.filter(challenge => 
        challenge.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(challenge => 
        challenge.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    if (filters.search) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        challenge.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>Learning Challenges</h1>
        <p>Enhance your skills with hands-on learning experiences</p>
      </div>

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
          <p>Showing {filteredChallenges.length} of {challenges.length} challenges</p>
        </div>
      </div>

      <div className="challenges-content">
        {loading ? (
          <LoadingSpinner message="Loading challenges..." />
        ) : filteredChallenges.length > 0 ? (
          <div className="challenges-grid">
            {filteredChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No challenges found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button 
              className="btn-secondary"
              onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;