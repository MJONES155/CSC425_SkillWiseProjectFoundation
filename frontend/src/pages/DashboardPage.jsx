import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { Box, Typography, Container, Paper } from '@mui/material';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box
      sx={{ width: '100%', minHeight: '100vh', bgcolor: '#dbe6ebff', py: 6 }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            borderRadius: 3,
            textAlign: 'center',
            background:
              'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(33, 150, 243, 0.12) 35%, rgba(76, 175, 80, 0.12) 65%, rgba(156, 39, 176, 0.12) 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(33, 150, 243, 0.05) 35%, rgba(76, 175, 80, 0.05) 65%, rgba(156, 39, 176, 0.05) 100%)',
              opacity: 0,
              transition: 'opacity 0.6s',
            },
            '&:hover::before': {
              opacity: 1,
            },
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome, {user?.firstName || user?.name || 'User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your learning progress and achievements
          </Typography>
        </Paper>

        {/* Dashboard Overview */}
        <DashboardOverview />
      </Container>
    </Box>
  );
};

export default DashboardPage;
