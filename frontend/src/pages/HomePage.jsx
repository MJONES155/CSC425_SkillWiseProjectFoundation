// TODO: Implement home/landing page with MUI
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';

const HomePage = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          py: 12,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to SkillWise
          </Typography>

          <Typography variant="h5" sx={{ mb: 4 }}>
            Your AI-powered learning companion for skill development
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              component={Link}
              to="/signup"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: '#81c784', borderColor: '#81c784' }}
              component={Link}
              to="/about"
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        {/* FEATURES SECTION */}
        <Container sx={{ py: 10 }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Features
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }} justifyContent="center">
            {/* Feature 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  AI-Powered Feedback
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Get personalized feedback on your work
                </Typography>
              </Paper>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Goal Tracking
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Set and track your learning goals
                </Typography>
              </Paper>
            </Grid>

            {/* Feature 3 — centered */}
            <Grid item xs={12} sm={6} md={4} sx={{ mx: 'auto' }}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Peer Reviews
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Learn from your peers through collaborative reviews
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
