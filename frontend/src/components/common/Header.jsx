import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import '../../styles/Header.css';

export default function HeaderTabs () {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Navigate when a tab is clicked
    switch (newValue) {
    case 0:
      navigate('/dashboard');
      break;
    case 1:
      navigate('/goals');
      break;
    case 2:
      navigate('/challenges');
      break;
    case 3:
      navigate('/progress');
      break;
    case 4:
      navigate('/leaderboard');
      break;
    case 5:
      navigate('/peer-review');
      break;
    default:
      break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <h1>SkillWise</h1>
        </div>
        {user ? (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', flexGrow: 1 }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="navigation tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Dashboard 📊" />
              <Tab label="Goals 🎯" />
              <Tab label="Challenges 🚀" />
              <Tab label="Progress 📈" />
              <Tab label="Leaderboard 🏆" />
              <Tab label="Peer Review 👥" />
            </Tabs>
          </Box>
        ) : (
          <nav className="nav-menu">
            <Link to="/">Home</Link>
          </nav>
        )}
        <div className="nav-actions">
          {user ? (
            <>
              <span>Welcome, {user.firstName}!</span>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
