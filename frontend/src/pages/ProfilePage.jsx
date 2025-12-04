// ProfilePage.jsx (MUI-styled version)
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import * as Sentry from '@sentry/react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  LinearProgress,
  Divider,
  Stack,
  Link,
  Chip,
} from '@mui/material';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { user, updateProfile } = useAuth();

  // Load profile data from APIs
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        // Fetch data in parallel - using overview for complete stats
        const [overviewRes, activityRes, skillsRes] = await Promise.all([
          apiService.progress.getOverview().catch(() => ({ data: null })),
          apiService.progress
            .getActivity({ limit: 5 })
            .catch(() => ({ data: [] })),
          apiService.progress.getSkills().catch(() => ({ data: [] })),
        ]);

        const overview = overviewRes.data?.data ?? overviewRes.data ?? {};
        const activity = activityRes.data?.data ?? activityRes.data ?? [];
        const skills = skillsRes.data?.data ?? skillsRes.data ?? [];

        // Extract totals from overview
        const totals = overview.totals || {};
        const level = Math.floor((totals.totalPoints || 0) / 1000) + 1; // Simple level calculation

        // Combine user data with fetched statistics
        const combinedData = {
          id: user?.id || 1,
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || '',
          email: user?.email || 'user@example.com',
          avatar: '👤',
          bio: user?.bio || 'Welcome to SkillWise!',
          location: user?.location || '',
          website: user?.website || '',
          joinedDate: user?.createdAt || new Date().toISOString(),
          level: level,
          totalPoints: totals.totalPoints || 0,
          completedChallenges: totals.completedChallenges || 0,
          goalsAchieved: totals.completedGoals || 0,
          currentStreak: totals.currentStreakDays || 0,
          longestStreak: totals.longestStreakDays || 0,
          badges: [], // Achievements endpoint not implemented yet
          skills: skills.map((s) => ({
            name: s.category || 'General',
            level: Math.min(100, (s.completed || 0) * 10), // Convert count to percentage
            category: s.category || 'General',
          })),
          recentActivity: activity.map((a) => ({
            id: a.id,
            eventType: a.type || a.eventType || 'activity',
            type: (a.type || a.eventType || '').includes('challenge')
              ? 'challenge'
              : (a.type || a.eventType || '').includes('goal')
              ? 'goal'
              : 'review',
            title:
              a.challengeTitle ||
              a.goalTitle ||
              (a.type || a.eventType || 'Activity').replace(/_/g, ' '),
            date: a.timestamp || a.timestampOccurred || a.createdAt,
            points: a.points || a.pointsEarned || 0,
          })),
          preferences: {
            emailNotifications: true,
            pushNotifications: false,
            weeklyDigest: true,
            publicProfile: true,
            showProgress: true,
          },
        };

        setProfileData(combinedData);
        setFormData(combinedData);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        Sentry.captureException(error);
        // Fallback to basic user data
        setProfileData({
          ...user,
          avatar: '👤',
          bio: 'Welcome to SkillWise!',
          badges: [],
          skills: [],
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfileData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = { challenge: '🏆', goal: '🎯', review: '👥', streak: '🔥' };
    return icons[type] || '📝';
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading && !profileData)
    return <LoadingSpinner message="Loading profile..." />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff', p: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, fontSize: 40 }}>
              {profileData?.avatar}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">
              {profileData?.firstName} {profileData?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profileData?.bio}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                📍 {profileData?.location}
              </Typography>
              <Typography variant="body2">
                📅 Joined {formatDate(profileData?.joinedDate)}
              </Typography>
              {profileData?.website && (
                <Link
                  href={profileData.website}
                  target="_blank"
                  rel="noopener"
                  variant="body2"
                >
                  🌐 {profileData.website}
                </Link>
              )}
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1} alignItems="center">
              <Typography variant="subtitle1">
                Level {profileData?.level}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          <Grid item>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {profileData?.totalPoints.toLocaleString()}
              </Typography>
              <Typography variant="body2">Total Points</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {profileData?.completedChallenges}
              </Typography>
              <Typography variant="body2">Challenges</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{profileData?.currentStreak}</Typography>
              <Typography variant="body2">Day Streak</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Overview" />
        <Tab label="Skills" />
        <Tab label="Badges" />
        <Tab label="Settings" />
      </Tabs>

      {/* Content */}
      {isEditing ? (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} mt={3}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Stack>
          </form>
        </Paper>
      ) : (
        <>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Stack spacing={1}>
                    {profileData.recentActivity &&
                    profileData.recentActivity.length > 0 ? (
                      profileData.recentActivity.map((activity) => (
                        <Box
                          key={activity.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5,
                          }}
                        >
                          <Box sx={{ fontSize: 18, mr: 1.5 }}>
                            {getActivityIcon(activity.type)}
                          </Box>
                          <Box flex={1}>
                            <Typography
                              variant="body2"
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {(activity.eventType || '').replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize="0.7rem"
                            >
                              {formatTimeAgo(activity.date)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={2}
                      >
                        No recent activity
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
              {/* Achievements */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {profileData.goalsAchieved}
                        </Typography>
                        <Typography variant="body2">Goals Achieved</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {profileData.longestStreak}
                        </Typography>
                        <Typography variant="body2">Longest Streak</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {profileData.badges.filter((b) => b.earned).length}
                        </Typography>
                        <Typography variant="body2">Badges Earned</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={2}>
              {profileData.skills.map((skill, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle1">
                          {skill.name}
                        </Typography>
                        <Typography variant="caption">
                          {skill.level}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={skill.level}
                      />
                      <Typography variant="caption">
                        {skill.category}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={2}>
              {profileData.badges.map((badge) => (
                <Grid item xs={12} sm={6} md={4} key={badge.id}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderColor: badge.earned ? 'primary.main' : 'grey.400',
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                  >
                    <Box sx={{ fontSize: 40 }}>{badge.icon}</Box>
                    <Typography variant="subtitle1">{badge.name}</Typography>
                    <Typography variant="body2" gutterBottom>
                      {badge.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={badge.earned ? 'success.main' : 'text.secondary'}
                    >
                      {badge.earned ? 'Earned ✓' : 'Locked 🔒'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Stack spacing={1}>
                {Object.keys(formData.preferences || {}).map((key) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        name={key}
                        checked={formData.preferences[key]}
                        onChange={handleInputChange}
                      />
                    }
                    label={key.replace(/([A-Z])/g, ' $1')}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={2} mt={3}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
