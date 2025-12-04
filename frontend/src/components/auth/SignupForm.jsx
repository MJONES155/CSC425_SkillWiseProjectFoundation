// src/components/auth/SignupForm.jsx
import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { Box, TextField, Button, Alert, Stack } from '@mui/material';

const SignupForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      console.error('Signup form submission error:', err);
      setError(err.message || 'An error occurred during registration.');
      Sentry.captureException(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
          inputProps={{ 'data-test': 'firstName' }}
        />

        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
          inputProps={{ 'data-test': 'lastName' }}
        />

        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          inputProps={{ 'data-test': 'email' }}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          inputProps={{ 'data-test': 'password' }}
        />

        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
          inputProps={{ 'data-test': 'confirmPassword' }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          data-test="signup-button"
        >
          Create Account
        </Button>
      </Stack>
    </Box>
  );
};

export default SignupForm;
