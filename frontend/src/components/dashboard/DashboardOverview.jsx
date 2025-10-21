// TODO: Implement dashboard overview component
import React from 'react';

const DashboardOverview = () => {
  // TODO: Add progress overview, recent activity, quick actions, statistics
  return (
    <div className="dashboard-overview">
      <h1>Welcome to SkillWise</h1>
      
      <div className="stats-grid">
        {/* TODO: Add statistics cards */}
        <div className="stat-card">
          <h3>Goals Completed</h3>
          <p className="stat-number">0</p>
        </div>
        
        <div className="stat-card">
          <h3>Challenges Completed</h3>
          <p className="stat-number">0</p>
        </div>
        
        <div className="stat-card">
          <h3>Current Streak</h3>
          <p className="stat-number">0 days</p>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* TODO: Add recent activity, progress charts */}
      </div>
    </div>
  );
};

export default DashboardOverview;