// TODO: Implement login form component
import React, { useState } from 'react';
import * as Sentry from '@sentry/react';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // TODO: Add form validation, error handling, loading state
  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(formData); // pass the email and password up to LoginPage
      }
    } catch (error) {
      console.error('Login form submission error:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login to SkillWise</h2>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          data-test="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          data-test="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>

      <button type="submit" className="btn-primary" data-test="login-button">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
