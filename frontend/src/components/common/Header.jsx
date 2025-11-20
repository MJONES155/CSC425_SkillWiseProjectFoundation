// TODO: Implement main navigation header component
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Header.css';

const Header = () => {
  // TODO: Add navigation menu, user profile dropdown, notifications
  const { user } = useAuth();
  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <h1>SkillWise</h1>
        </div>
        <nav className="nav-menu">
          {/* Only link to dashboard if user */}
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/goals">Goals</Link>
              <Link to="/challenges">Challenges</Link>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
            </>
          )}
        </nav>
        <div className="nav-actions">
          {/* TODO: Add user profile, notifications */}
          {/*Only link to profile if user*/}
          {user ? (
            <>
              <span>Welcome, {user.firstName}!</span>
              <Link to="/profile">Profile</Link>
              {/* You could add a logout button here later */}
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
};

export default Header;
