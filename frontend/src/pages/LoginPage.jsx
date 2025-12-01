// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as Sentry from '@sentry/react';

import { Box, Paper, Typography, Grid, Link, Alert } from '@mui/material';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (formData) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please try again.');
        Sentry.captureException(new Error(result.error || 'Login failed'));
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '200vh', bgcolor: '#f5f5f5', py: 6 }}>
      <Grid container justifyContent="center" spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to continue your learning journey
              </Typography>
            </Box>

            {error && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fdecea', borderRadius: 1 }}>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              </Box>
            )}

            {isLoading ? (
              <LoadingSpinner message="Signing you in..." />
            ) : (
              <LoginForm onSubmit={handleLogin} />
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2">
                Don’t have an account?{' '}
                <Link component={RouterLink} to="/signup">
                  Sign up here
                </Link>
              </Typography>

              <Typography variant="body2" mt={1}>
                <Link component={RouterLink} to="/forgot-password">
                  Forgot your password?
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
