// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { Box, TextField, Button, Alert, Stack } from '@mui/material';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      console.error('Login form submission error:', err);
      setError(err.message || 'An error occurred during login.');
      Sentry.captureException(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          data-test="login-button"
        >
          Login
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginForm;
