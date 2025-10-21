// TODO: Implement login page with form handling
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (formData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <h1>SkillWise</h1>
            </Link>
            <h2>Welcome Back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Signing you in..." />
          ) : (
            <LoginForm onSubmit={handleLogin} />
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
            
            <p>
              <Link to="/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="auth-testimonial">
            <blockquote>
              "SkillWise transformed how I learn. The AI feedback is incredibly helpful!"
            </blockquote>
            <cite>— Sarah K., Software Developer</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;