//Commented out for ESLINT
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Snackbar, Alert } from '@mui/material';

// // Import all pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';
import GoalsPage from './pages/GoalsPage';
import GoalDetail from './pages/GoalDetail';
import ChallengesPage from './pages/ChallengesPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PeerReviewPage from './pages/PeerReviewPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';
import Header from './components/common/Header.jsx';

//END ESLINT Comment

// Import layout components (TODO: Create these)
// import Navbar from './components/layout/Navbar';
// import Footer from './components/layout/Footer';

function App() {
  const [rateLimitNotification, setRateLimitNotification] = useState({
    open: false,
    message: '',
  });

  useEffect(() => {
    // Listen for rate limit events from API interceptor
    const handleRateLimit = (event) => {
      const retryAfter = event.detail?.retryAfter || 60;
      setRateLimitNotification({
        open: true,
        message: `Slow down! Too many requests. Automatically retrying in ${Math.min(
          retryAfter,
          3
        )} seconds...`,
      });
    };

    window.addEventListener('api:rate-limit', handleRateLimit);

    return () => {
      window.removeEventListener('api:rate-limit', handleRateLimit);
    };
  }, []);

  const handleCloseNotification = () => {
    setRateLimitNotification({ open: false, message: '' });
  };

  return (
    <div className="App">
      {/* TODO: Add Navbar component */}
      <Header />

      {/* Rate Limit Notification */}
      <Snackbar
        open={rateLimitNotification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity="warning"
          sx={{ width: '100%' }}
        >
          {rateLimitNotification.message}
        </Alert>
      </Snackbar>

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <GoalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:id"
            element={
              <ProtectedRoute>
                <GoalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <ChallengesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peer-review"
            element={
              <ProtectedRoute>
                <PeerReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* TODO: Add Footer component */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
