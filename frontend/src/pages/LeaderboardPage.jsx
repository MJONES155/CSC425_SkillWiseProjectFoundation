// TODO: Implement leaderboard and rankings page with MUI styling
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const { user } = useAuth();

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockLeaderboardData = [
      {
        id: 1,
        rank: 1,
        name: 'Alex Johnson',
        avatar: '👨‍💻',
        points: 2450,
        level: 8,
        completedChallenges: 45,
        isCurrentUser: false,
      },
      {
        id: 2,
        rank: 2,
        name: 'Sarah Kim',
        avatar: '👩‍🎨',
        points: 2380,
        level: 8,
        completedChallenges: 42,
        isCurrentUser: false,
      },
      {
        id: 3,
        rank: 3,
        name: 'Mike Chen',
        avatar: '👨‍🔬',
        points: 2290,
        level: 7,
        completedChallenges: 38,
        isCurrentUser: false,
      },
      {
        id: 4,
        rank: 4,
        name: 'Emma Rodriguez',
        avatar: '👩‍💼',
        points: 2150,
        level: 7,
        completedChallenges: 35,
        isCurrentUser: false,
      },
      {
        id: 5,
        rank: 5,
        name: user?.firstName + ' ' + user?.lastName || 'You',
        avatar: '👤',
        points: 1850,
        level: 6,
        completedChallenges: 28,
        isCurrentUser: true,
      },
      {
        id: 6,
        rank: 6,
        name: 'David Park',
        avatar: '👨‍🎓',
        points: 1720,
        level: 6,
        completedChallenges: 25,
        isCurrentUser: false,
      },
      {
        id: 7,
        rank: 7,
        name: 'Lisa Zhang',
        avatar: '👩‍🔧',
        points: 1650,
        level: 5,
        completedChallenges: 23,
        isCurrentUser: false,
      },
    ];

    setTimeout(() => {
      setLeaderboardData(mockLeaderboardData);
      setLoading(false);
    }, 1000);
  }, [timeframe, category, user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const currentUserRank =
    leaderboardData.find((u) => u.isCurrentUser)?.rank || 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" fontWeight={700}>
            Leaderboard
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            See how you compare with other learners
          </Typography>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }} justifyContent="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="all-time">All Time</MenuItem>
                <MenuItem value="this-month">This Month</MenuItem>
                <MenuItem value="this-week">This Week</MenuItem>
                <MenuItem value="today">Today</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="overall">Overall Points</MenuItem>
                <MenuItem value="challenges">Challenges Completed</MenuItem>
                <MenuItem value="goals">Goals Achieved</MenuItem>
                <MenuItem value="streak">Learning Streak</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Current User Summary */}
        {currentUserRank > 0 && (
          <Paper
            elevation={4}
            sx={{
              mb: 5,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1976d2, #4fc3f7)',
              color: 'white',
            }}
          >
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Your Ranking
            </Typography>

            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="h3" fontWeight={700}>
                #{currentUserRank}
              </Typography>

              <Box>
                <Typography>
                  You're in the top{' '}
                  <strong>
                    {Math.round(
                      (currentUserRank / leaderboardData.length) * 100
                    )}
                    %
                  </strong>{' '}
                  of learners!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Keep learning to climb higher!
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {loading ? (
          <LoadingSpinner message="Loading leaderboard..." />
        ) : (
          <>
            {/* Podium */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} mb={3}>
                Top Performers
              </Typography>

              <Grid container spacing={3}>
                {leaderboardData.slice(0, 3).map((user, index) => (
                  <Grid item xs={12} md={4} key={user.id}>
                    <Card
                      elevation={6}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        textAlign: 'center',
                        background:
                          index === 0
                            ? 'linear-gradient(135deg, #ffeb3b, #ffc107)'
                            : index === 1
                            ? 'linear-gradient(135deg, #e0e0e0, #bdbdbd)'
                            : 'linear-gradient(135deg, #ff8a65, #ff7043)',
                        color: 'black',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h3">
                          {getRankIcon(user.rank)}
                        </Typography>

                        <Typography variant="h5" fontWeight={600}>
                          {user.name}
                        </Typography>

                        <Typography>{user.points} points</Typography>

                        <Chip
                          label={`Level ${user.level}`}
                          sx={{ mt: 1, fontWeight: 600 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Full Table */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} mb={2}>
                Complete Rankings
              </Typography>

              <Paper elevation={3}>
                {leaderboardData.map((user, index) => (
                  <Box
                    key={user.id}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom:
                        index < leaderboardData.length - 1
                          ? '1px solid #eee'
                          : 'none',
                      bgcolor: user.isCurrentUser ? 'rgba(25,118,210,0.1)' : '',
                    }}
                  >
                    <Typography
                      width="50px"
                      textAlign="center"
                      fontWeight={700}
                    >
                      {getRankIcon(user.rank)}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={2}
                      flex={1}
                      alignItems="center"
                    >
                      <Typography fontSize={24}>{user.avatar}</Typography>

                      <Box>
                        <Typography fontWeight={600}>
                          {user.name}
                          {user.isCurrentUser && (
                            <Typography component="span" variant="body2">
                              {' '}
                              (You)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      width="120px"
                      textAlign="right"
                      fontWeight={700}
                    >
                      {user.points.toLocaleString()}
                    </Typography>

                    <Chip
                      label={`Level ${user.level}`}
                      sx={{ mx: 2 }}
                      size="small"
                    />

                    <Typography width="80px" textAlign="center">
                      {user.completedChallenges}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Achievements */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} mb={3}>
                Top Achievements This Week
              </Typography>

              <Grid container spacing={3}>
                {[
                  {
                    icon: '🚀',
                    title: 'Challenge Master',
                    text: 'Completed 5 challenges in one day',
                    user: 'Alex Johnson',
                  },
                  {
                    icon: '🔥',
                    title: 'Streak Legend',
                    text: '30-day learning streak',
                    user: 'Sarah Kim',
                  },
                  {
                    icon: '🎯',
                    title: 'Goal Crusher',
                    text: 'Completed 3 learning goals',
                    user: 'Mike Chen',
                  },
                ].map((a, i) => (
                  <Grid item xs={12} md={4} key={i}>
                    <Card elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                      <Typography fontSize={40}>{a.icon}</Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {a.title}
                      </Typography>

                      <Typography fontSize={14} sx={{ opacity: 0.7 }}>
                        {a.text}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>
                        Earned by {a.user}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LeaderboardPage;
