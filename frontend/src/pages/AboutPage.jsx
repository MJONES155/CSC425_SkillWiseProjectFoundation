// AboutPage.jsx
import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';

const AboutPage = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          About SkillWise
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          SkillWise is a personal learning challenge platform that helps you
          turn your goals into actionable tasks. Track your progress, receive
          AI-powered feedback, and collaborate with peers to achieve your
          learning objectives.
        </Typography>

        {/* Features Section */}

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4caf50, #81c784)', // Green gradient
              }}
              elevation={3}
            >
              <Typography variant="h5" gutterBottom>
                Goal & Challenge Tracking
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Set personal learning objectives and break them into manageable
                challenges. Monitor your progress and stay motivated with clear
                visual tracking.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2196f3, #64b5f6)', // Blue gradient
              }}
              elevation={3}
            >
              <Typography variant="h5" gutterBottom>
                AI-Powered Feedback
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Receive personalized feedback and hints from our AI system to
                improve your skills and refine your learning strategies.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #9c27b0, #ba68c8)', // Purple gradient
              }}
              elevation={3}
            >
              <Typography variant="h5" gutterBottom>
                Peer Collaboration
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Share insights, review challenges, and participate in
                leaderboards with classmates to learn together and stay
                accountable.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ff9800, #ffb74d)', // Orange gradient
              }}
              elevation={3}
            >
              <Typography variant="h5" gutterBottom>
                Progress Visualization
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Track your growth over time with intuitive charts and
                statistics, helping you identify strengths and areas for
                improvement.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutPage;
