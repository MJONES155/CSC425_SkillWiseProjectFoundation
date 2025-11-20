// Progress tracking and analytics page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  LinearProgress,
  Select,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';

const tfToParam = (tf) =>
  tf === 'month' ? '30d' : tf === 'year' ? '90d' : '7d';

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ovRes, actRes, anRes, skRes] = await Promise.all([
        apiService.progress.getOverview(),
        apiService.progress.getActivity({
          timeframe: tfToParam(timeframe),
          limit: 10,
        }),
        apiService.progress
          .getStats({ params: { timeframe: tfToParam(timeframe) } })
          .catch(() => ({ data: { data: null } })),
        apiService.progress.getSkills().catch(() => ({ data: { data: [] } })),
      ]);

      const ov = ovRes.data?.data ?? ovRes.data;
      const act = actRes.data?.data ?? actRes.data ?? [];
      const an = anRes.data?.data ?? anRes.data ?? null;
      const sk = skRes.data?.data ?? skRes.data ?? [];

      setOverview(ov);
      setActivity(act);
      setAnalytics(an);
      setSkills(sk);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [timeframe]);

  if (loading) return <LoadingSpinner message="Loading your progress..." />;
  if (error) return <Typography color="error">{error}</Typography>;

  const daily = analytics?.daily || [];
  const weeklyBars = daily
    .map((d) => ({
      label: d.date.slice(5),
      points: d.points,
      events: d.events,
    }))
    .slice(-7);

  const totalGoals = overview?.goals?.length ?? 0;
  const completedGoals = overview?.totals?.completedGoals ?? 0;
  const overallProgressPercentage =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700}>
          Your Learning Progress
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track your journey and celebrate your achievements
        </Typography>
      </Box>

      {/* OVERALL PROGRESS CARD */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight={600}>
            Overall Goal Progress
          </Typography>
          <Typography variant="h3" color="success.main" fontWeight={700}>
            {overallProgressPercentage}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={overallProgressPercentage}
          sx={{ height: 12, borderRadius: 2, mb: 2 }}
        />

        <Typography align="center" color="text.secondary">
          {completedGoals} of {totalGoals} goals completed
        </Typography>
      </Card>

      {/* STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: 'Total Points',
            value: overview?.totals?.totalPoints ?? 0,
            icon: '🎯',
          },
          {
            label: 'Goals Completed',
            value: overview?.totals?.completedGoals ?? 0,
            icon: '✅',
          },
          {
            label: 'Challenges Done',
            value: overview?.totals?.completedChallenges ?? 0,
            icon: '🚀',
          },
          {
            label: 'Day Streak',
            value: overview?.totals?.currentStreakDays ?? 0,
            sub: `Longest: ${overview?.totals?.longestStreakDays ?? 0}`,
            icon: '🔥',
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography fontSize="2rem">{item.icon}</Typography>
                <Typography variant="h4">{item.value}</Typography>
                <Typography color="text.secondary">{item.label}</Typography>
                {item.sub && (
                  <Typography variant="caption" color="text.secondary">
                    {item.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MAIN SECTIONS: ACTIVITY + RECENT */}
      <Grid container spacing={4}>
        {/* ACTIVITY CHART SECTION */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Activity</Typography>

              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                size="small"
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Quarter</MenuItem>
              </Select>
            </Box>

            <Box
              display="flex"
              gap={2}
              alignItems="flex-end"
              sx={{ height: 200 }}
            >
              {weeklyBars.map((d, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  flex={1}
                >
                  <Typography variant="caption">{d.label}</Typography>

                  <Box
                    sx={{
                      width: '100%',
                      background: '#4CAF50',
                      height: Math.max(d.points / 2, 5),
                      borderRadius: 1,
                      transition: 'height 0.3s',
                    }}
                  />

                  <Typography variant="caption">{d.points}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* RECENT ACTIVITY */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" mb={2}>
              Recent Activity
            </Typography>

            <Box sx={{ maxHeight: 340, overflow: 'auto' }}>
              {activity.length === 0 && (
                <Typography color="text.secondary">
                  No recent activity yet.
                </Typography>
              )}

              {activity.map((ev) => (
                <Paper key={ev.id} sx={{ p: 2, mb: 2 }}>
                  <Typography fontSize="1.5rem">
                    {ev.type === 'challenge_completed'
                      ? '🚀'
                      : ev.type?.includes('goal')
                      ? '🎯'
                      : '🧭'}
                  </Typography>

                  <Typography variant="subtitle1" fontWeight={600}>
                    {ev.type.replace(/_/g, ' ')}{' '}
                    {ev.challengeTitle || ev.goalTitle ? '— ' : ''}
                    {ev.challengeTitle || ev.goalTitle}
                  </Typography>

                  {ev.points > 0 && (
                    <Typography variant="body2">+{ev.points} points</Typography>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    {new Date(ev.timestamp).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* SKILLS GRID */}
      <Card sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" mb={3}>
          Skill Breakdown
        </Typography>

        <Grid container spacing={3}>
          {skills.length === 0 && (
            <Typography color="text.secondary">
              Complete challenges to build your skills.
            </Typography>
          )}

          {skills.map((s, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {s.category}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed: {s.completed}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, s.completed * 10)}
                  sx={{ my: 2, height: 10, borderRadius: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Container>
  );
};

export default ProgressPage;
