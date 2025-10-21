// TODO: Implement goals management page
import React, { useState } from 'react';
import GoalCard from '../components/goals/GoalCard';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  
  // TODO: Add goal creation, filtering, search, sorting
  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>My Learning Goals</h1>
        <button className="btn-primary">Create New Goal</button>
      </div>

      <div className="goals-filters">
        {/* TODO: Add filters for category, status, difficulty */}
        <select>
          <option value="">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div className="goals-grid">
        {goals.length > 0 ? (
          goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <div className="empty-state">
            <p>No goals yet. Create your first learning goal!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;