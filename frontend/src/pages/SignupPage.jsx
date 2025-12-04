// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as Sentry from '@sentry/react';

import {
  Box,
  Paper,
  Typography,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        Sentry.captureException(
          new Error(result.error || 'Registration failed')
        );
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 6 }}>
      <Grid container justifyContent="center" spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Create Your Account
              </Typography>
              <Typography variant="body1">
                Start your personalized learning journey today
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
              <LoadingSpinner message="Creating your account..." />
            ) : (
              <SignupForm onSubmit={handleSubmit} />
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Features Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>
              What you'll get:
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemText primary="✅ Personalized learning paths" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="✅ AI-powered feedback" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="✅ Progress tracking" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="✅ Peer learning community" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="✅ Achievement system" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SignupPage;
