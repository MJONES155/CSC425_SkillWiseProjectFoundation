import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useAuth } from '../../hooks/useAuth';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function HeaderTabs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const authenticatedTabs = [
    { label: 'Dashboard 📊', path: '/dashboard' },
    { label: 'Goals 🎯', path: '/goals' },
    { label: 'Challenges 🚀', path: '/challenges' },
    { label: 'Progress 📈', path: '/progress' },
    { label: 'Leaderboard 🏆', path: '/leaderboard' },
    { label: 'Peer Review 👥', path: '/peer-review' },
    { label: 'Profile 👤', path: '/profile' },
  ];

  const unauthTabs = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
  ];

  // Determine which tab set is active and if current path matches
  const currentTabs = user ? authenticatedTabs : unauthTabs;
  const validPaths = currentTabs.map((tab) => tab.path);
  const currentValue = validPaths.includes(location.pathname)
    ? location.pathname
    : false;

  const handleChange = (e, newValue) => {
    navigate(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      Sentry.captureException(err);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        {/* LEFT SIDE — Logo + SkillWise */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            mr: 3,
          }}
        >
          <Box
            component="img"
            src="/favicon.ico" // Your logo path
            alt="SkillWise Logo"
            sx={{ width: 40, height: 40, mr: 1 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            SkillWise
          </Typography>
        </Box>

        {/* CENTER (authenticated only) */}
        {user && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={currentValue}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="navigation tabs"
            >
              {authenticatedTabs.map((tab) => (
                <Tab
                  key={tab.path}
                  label={tab.label}
                  value={tab.path}
                  component={Link}
                  to={tab.path}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* RIGHT SIDE — Unauth tabs OR Profile/Logout */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          {!user ? (
            <Tabs
              value={currentValue}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="primary"
            >
              {unauthTabs.map((tab) => (
                <Tab
                  key={tab.path}
                  label={tab.label}
                  value={tab.path}
                  component={Link}
                  to={tab.path}
                />
              ))}
            </Tabs>
          ) : (
            <>
              <Typography variant="body1">
                Welcome, {user.firstName}!
              </Typography>

              <Button
                component={Link}
                to="/profile"
                variant="outlined"
                size="small"
              >
                Profile
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
