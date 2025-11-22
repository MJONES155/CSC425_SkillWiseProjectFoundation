// TODO: Implement dashboard page with navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/challenges', label: 'Challenges', icon: '🚀' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/peer-review', label: 'Peer Review', icon: '👥' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Track your learning progress and achievements</p>
          </div>
          <DashboardOverview />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
