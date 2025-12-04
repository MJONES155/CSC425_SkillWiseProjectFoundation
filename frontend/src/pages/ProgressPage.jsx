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

  useEffect(() => {
    // Listen for goal progress updates from other pages
    const handleProgressUpdate = () => {
      loadAll();
    };
    window.addEventListener('goal:progress-updated', handleProgressUpdate);

    return () => {
      window.removeEventListener('goal:progress-updated', handleProgressUpdate);
    };
  }, []);

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

  const totalGoals =
    overview?.totals?.totalGoals ?? overview?.goals?.length ?? 0;
  const completedGoals = overview?.totals?.completedGoals ?? 0;
  const totalChallenges = overview?.totals?.totalChallenges ?? 0;
  const completedChallenges = overview?.totals?.completedChallenges ?? 0;

  // Use backend's calculated overall progress (blends challenges and goals)
  const overallProgressPercentage = overview?.overallProgressPercentage ?? 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff' }}>
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
        <Card
          sx={{
            mb: 4,
            p: 3,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
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
            {completedChallenges} of {totalChallenges} challenges completed
            {totalGoals > 0 &&
              ` • ${completedGoals} of ${totalGoals} goals completed`}
          </Typography>
        </Card>

        {/* STATS GRID - WRAPPED IN SINGLE CARD */}
        <Card
          sx={{
            mb: 4,
            p: 3,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" fontWeight={600} mb={3}>
            Your Accomplishments
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                label: 'Total Points',
                value: overview?.totals?.totalPoints ?? 0,
                sub: ' ',
                icon: '🎯',
              },
              {
                label: 'Goals Completed',
                value: overview?.totals?.completedGoals ?? 0,
                sub: ' ',
                icon: '✅',
              },
              {
                label: 'Challenges Done',
                value: overview?.totals?.completedChallenges ?? 0,
                sub: '',
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
                <Paper
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: 2,
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <Typography fontSize="2.5rem" mb={1}>
                    {item.icon}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {item.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {item.label}
                  </Typography>
                  {item.sub && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={0.5}
                    >
                      {item.sub}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* MAIN SECTIONS: COMBINED ACTIVITY + SKILLS */}
        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
          {/* LEFT: ACTIVITY CHART + RECENT ACTIVITY SIDE BY SIDE */}
          <Box sx={{ flex: '0 0 75%' }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{ display: 'flex', gap: 3, height: '100%', minHeight: 0 }}
              >
                {/* ACTIVITY CHART */}
                <Box sx={{ flex: '0 0 50%', minWidth: 0 }}>
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h5" fontWeight={600}>
                      Activity
                    </Typography>

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
                </Box>

                {/* RECENT ACTIVITY */}
                <Box
                  sx={{
                    flex: '0 0 50%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h5" fontWeight={600} mb={2}>
                    Recent Activity
                  </Typography>

                  <Box
                    sx={{
                      maxHeight: 300,
                      overflow: 'auto',
                      pr: 1,
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    {activity.length === 0 && (
                      <Typography color="text.secondary">
                        No recent activity yet.
                      </Typography>
                    )}

                    {activity.map((ev) => (
                      <Paper
                        key={ev.id}
                        sx={{ p: 1.5, mb: 1.5, borderRadius: 1.5 }}
                      >
                        <Typography fontSize="1.5rem">
                          {ev.type === 'challenge_completed'
                            ? '🚀'
                            : ev.type?.includes('goal')
                            ? '🎯'
                            : '🧭'}
                        </Typography>

                        <Typography variant="subtitle2" fontWeight={600} mt={1}>
                          {ev.type
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}{' '}
                          {ev.challengeTitle || ev.goalTitle ? '— ' : ''}
                          <Typography
                            component="span"
                            color="text.secondary"
                            variant="subtitle2"
                          >
                            {ev.challengeTitle || ev.goalTitle}
                          </Typography>
                        </Typography>

                        {ev.points > 0 && (
                          <Typography
                            variant="body2"
                            color="success.main"
                            fontWeight={600}
                            mt={0.5}
                          >
                            +{ev.points} points
                          </Typography>
                        )}

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.5}
                        >
                          {new Date(ev.timestamp).toLocaleString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* RIGHT: SKILLS BREAKDOWN */}
          <Box sx={{ flex: '0 0 25%' }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h5" fontWeight={600} mb={3}>
                Skill Breakdown
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  maxHeight: 450,
                  overflow: 'auto',
                  pr: 1,
                }}
              >
                {skills.length === 0 && (
                  <Typography color="text.secondary">
                    Complete challenges to build your skills.
                  </Typography>
                )}

                {skills.map((s, idx) => (
                  <Paper key={idx} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} mb={1}>
                      {s.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Completed:{' '}
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="primary"
                      >
                        {s.completed}
                      </Typography>
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, s.completed * 10)}
                      sx={{ height: 10, borderRadius: 1 }}
                    />
                  </Paper>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProgressPage;
