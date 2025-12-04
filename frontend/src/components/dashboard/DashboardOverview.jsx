import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Stack,
  Chip,
  Avatar,
  Dialog,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import GoalForm from '../goals/GoalForm';
import ChallengeForm from '../challenges/ChallengeForm';
import * as Sentry from '@sentry/react';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeGoals: 0,
    challengesCompleted: 0,
    weeklyProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentGoals, setCurrentGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadDashboardData();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadDashboardData = async () => {
    if (isLoadingRef.current) return; // Prevent concurrent calls

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const [goalsRes, challengesRes, progressRes, overviewRes] =
        await Promise.all([
          apiService.goals.getAll(),
          apiService.challenges.getAll(),
          apiService.progress.getActivity({ limit: 5 }),
          apiService.progress.getOverview(),
        ]);

      const goals = goalsRes.data?.data ?? goalsRes.data ?? [];
      const challenges = challengesRes.data?.data ?? challengesRes.data ?? [];
      const activity = progressRes.data?.data ?? progressRes.data ?? [];
      const overview = overviewRes.data?.data ?? overviewRes.data ?? {};

      const activeGoals = goals.filter((g) => !g.isCompleted).length;
      const completedChallenges = challenges.filter(
        (c) => c.status === 'completed'
      ).length;

      // Use actual overall progress percentage from backend
      const weeklyProgress = overview.overallProgressPercentage || 0;

      setStats({
        activeGoals,
        challengesCompleted: completedChallenges,
        weeklyProgress,
      });
      setRecentActivity(activity.slice(0, 5));
      setCurrentGoals(goals.filter((g) => !g.isCompleted).slice(0, 5));
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleGoalSubmit = async (goalData) => {
    try {
      await apiService.goals.create(goalData);
      setShowGoalForm(false);
      loadDashboardData(); // Reload dashboard data
    } catch (err) {
      console.error('Failed to create goal:', err);
      Sentry.captureException(err);
    }
  };

  const handleChallengeSubmit = async (challengeData) => {
    try {
      await apiService.challenges.create(challengeData);
      setShowChallengeForm(false);
      loadDashboardData(); // Reload dashboard data
    } catch (err) {
      console.error('Failed to create challenge:', err);
      Sentry.captureException(err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => (
    <Card
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `6px solid ${color}`,
        transition: 'all 0.3s ease',
        animation: 'fadeSlideUp 0.5s ease-out',
        '@keyframes fadeSlideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {value}
              {suffix && (
                <Typography
                  component="span"
                  variant="h5"
                  color="text.secondary"
                >
                  {suffix}
                </Typography>
              )}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            <Icon fontSize="large" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      if (type?.includes('challenge_completed')) return '🚀';
      if (type?.includes('goal')) return '🎯';
      if (type?.includes('challenge')) return '🏆';
      return '✅';
    };

    const formatDate = (date) => {
      if (!date) return 'Recently';
      const d = new Date(date);
      const diffHrs = Math.floor((new Date() - d) / (1000 * 60 * 60));
      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    };

    const eventType = activity.eventType || activity.type || 'Activity';
    const title = activity.challengeTitle || activity.goalTitle || '';
    const points = activity.pointsEarned || activity.points || 0;

    return (
      <Card
        elevation={1}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 2,
          transition: '0.2s',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateX(4px)',
          },
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Typography fontSize="1.8rem">{getIcon(eventType)}</Typography>
          <Box flex={1}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ textTransform: 'capitalize' }}
            >
              {eventType.replace(/_/g, ' ')}
              {title && (
                <Typography
                  component="span"
                  color="text.secondary"
                  fontWeight={400}
                >
                  {' '}
                  — {title}
                </Typography>
              )}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              {points > 0 && (
                <Chip
                  label={`+${points} pts`}
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {formatDate(
                  activity.timestampOccurred ||
                    activity.createdAt ||
                    activity.timestamp
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    );
  };

  const GoalItem = ({ goal }) => {
    const getDifficultyColor = (diff) => {
      if (diff === 'easy') return '#2e7d32';
      if (diff === 'medium') return '#ed6c02';
      if (diff === 'hard') return '#d32f2f';
      return '#757575';
    };

    return (
      <Card
        elevation={2}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          borderLeft: `4px solid ${getDifficultyColor(goal.difficulty)}`,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateX(6px)',
          },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ flexGrow: 1, mr: 1 }}
          >
            {goal.title}
          </Typography>
          <Chip
            label={goal.difficulty}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${getDifficultyColor(
                goal.difficulty
              )} 0%, ${getDifficultyColor(goal.difficulty)}cc 100%)`,
              color: 'white',
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              boxShadow: 1,
            }}
          />
        </Box>
        <Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              {goal.progressPercentage || 0}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 8,
              bgcolor: '#e0e0e0',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${goal.progressPercentage || 0}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${getDifficultyColor(
                  goal.difficulty
                )} 0%, ${getDifficultyColor(goal.difficulty)}aa 100%)`,
                transition: 'width 0.3s',
                borderRadius: 4,
              }}
            />
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <>
      {/* Top Row: Stats + Quick Actions - All same width */}
      <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Stats */}
        {[
          {
            title: 'Active Goals',
            value: stats.activeGoals,
            icon: AssignmentIcon,
            color: '#1976d2',
          },
          {
            title: 'Challenges Completed',
            value: stats.challengesCompleted,
            icon: TrophyIcon,
            color: '#2e7d32',
          },
          {
            title: 'Weekly Progress',
            value: stats.weeklyProgress,
            icon: TrendingUpIcon,
            color: '#ed6c02',
            suffix: '%',
          },
        ].map((stat) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={stat.title}
            sx={{
              display: 'flex',
              height: { xs: 'auto', md: 200 },
              width: '23.95%',
            }}
          >
            <StatCard {...stat} />
          </Grid>
        ))}

        {/* Quick Actions - Same width as stats */}
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            display: 'flex',
            height: { xs: 'auto', md: 200 },
            width: '23.95%',
          }}
        >
          <Card
            elevation={3}
            sx={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2 } }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
              >
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.75,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  onClick={() => setShowGoalForm(true)}
                >
                  Goal
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.75,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                  onClick={() => setShowChallengeForm(true)}
                >
                  Challenge
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckIcon />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.75,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => navigate('/progress')}
                >
                  Progress
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row: Goals and Activity - Same total width as top row, equal sizes */}
      <Grid container spacing={{ xs: 2, md: 2 }}>
        {/* Current Goals */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            height: { xs: 'auto', md: 500 },
            width: '49.1%',
          }}
        >
          <Card
            elevation={3}
            sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent
              sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Current Goals
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Box py={6} textAlign="center">
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              ) : currentGoals.length > 0 ? (
                <Box>
                  {currentGoals.map((goal) => (
                    <GoalItem key={goal.id} goal={goal} />
                  ))}
                </Box>
              ) : (
                <Box py={6} textAlign="center">
                  <Typography color="text.secondary">
                    No active goals. Use Quick Actions to create one!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            height: { xs: 'auto', md: 500 },
            width: '49.1%',
          }}
        >
          <Card
            elevation={3}
            sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent
              sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Box py={6} textAlign="center">
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              ) : recentActivity.length > 0 ? (
                <Box>
                  {recentActivity.map((act, i) => (
                    <ActivityItem key={i} activity={act} />
                  ))}
                </Box>
              ) : (
                <Box py={6} textAlign="center">
                  <Typography color="text.secondary">
                    No recent activity. Start a challenge to get going!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <GoalForm
          onSubmit={handleGoalSubmit}
          onClose={() => setShowGoalForm(false)}
        />
      )}

      {/* Challenge Form Modal */}
      {showChallengeForm && (
        <ChallengeForm
          onSubmit={handleChallengeSubmit}
          onClose={() => setShowChallengeForm(false)}
        />
      )}
    </>
  );
};

export default DashboardOverview;
