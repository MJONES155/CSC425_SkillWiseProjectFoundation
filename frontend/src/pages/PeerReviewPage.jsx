// PeerReviewPage.jsx (MUI version with visual polish)
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Stack,
  Paper,
} from '@mui/material';

import RateReviewIcon from '@mui/icons-material/RateReview';
import DoneIcon from '@mui/icons-material/Done';
import HistoryIcon from '@mui/icons-material/History';

const PeerReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review-others');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

  // ---------------------------- Mock Data ---------------------------
  useEffect(() => {
    const mockReviews = [
      {
        id: 1,
        submissionId: 'sub_001',
        title: 'React Component Optimization',
        author: 'Sarah Kim',
        authorAvatar: '👩‍🎨',
        category: 'React',
        difficulty: 'Intermediate',
        submittedAt: '2025-11-15T10:00:00Z',
        description: 'Created a custom hook for data fetching with caching',
        codeSnippet: 'const useDataFetch = (url) => { ... }',
        needsReview: true,
        reviewsCount: 2,
        maxReviews: 3,
      },
      {
        id: 2,
        submissionId: 'sub_002',
        title: 'Algorithm Implementation',
        author: 'Mike Chen',
        authorAvatar: '👨‍🔬',
        category: 'Algorithms',
        difficulty: 'Advanced',
        submittedAt: '2025-11-14T15:30:00Z',
        description: 'Implemented merge sort with performance optimizations',
        codeSnippet: 'function mergeSort(arr) { ... }',
        needsReview: true,
        reviewsCount: 1,
        maxReviews: 3,
      },
      {
        id: 3,
        submissionId: 'sub_003',
        title: 'Database Design Pattern',
        author: 'Emma Rodriguez',
        authorAvatar: '👩‍💼',
        category: 'Database',
        difficulty: 'Intermediate',
        submittedAt: '2025-11-13T09:15:00Z',
        description: 'Repository pattern implementation with TypeORM',
        codeSnippet: 'class UserRepository extends Repository { ... }',
        needsReview: false,
        reviewsCount: 3,
        maxReviews: 3,
      },
    ];

    const mockMySubmissions = [
      {
        id: 1,
        submissionId: 'my_sub_001',
        title: 'CSS Grid Layout Challenge',
        category: 'CSS',
        difficulty: 'Beginner',
        submittedAt: '2025-11-12T14:20:00Z',
        status: 'under-review',
        reviewsReceived: 2,
        maxReviews: 3,
        averageRating: 4.5,
        feedback: 'Great responsive design approach!',
      },
      {
        id: 2,
        submissionId: 'my_sub_002',
        title: 'API Integration Pattern',
        category: 'JavaScript',
        difficulty: 'Intermediate',
        submittedAt: '2025-11-10T11:45:00Z',
        status: 'completed',
        reviewsReceived: 3,
        maxReviews: 3,
        averageRating: 4.7,
        feedback: 'Excellent error handling and clean code structure',
      },
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setMySubmissions(mockMySubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  // ---------------------------- Helpers ---------------------------

  const filteredReviews = reviews.filter(
    (review) =>
      selectedCategory === 'all' ||
      review.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'success',
      Intermediate: 'warning',
      Advanced: 'error',
    };
    return colors[difficulty] || 'default';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusChip = (status) => {
    const config = {
      'under-review': {
        label: 'Under Review',
        color: 'info',
        icon: <HistoryIcon />,
      },
      completed: { label: 'Completed', color: 'success', icon: <DoneIcon /> },
      'needs-revision': {
        label: 'Needs Revision',
        color: 'warning',
        icon: <RateReviewIcon />,
      },
    };
    const c = config[status] ?? { label: status, color: 'default' };
    return <Chip size="small" icon={c.icon} label={c.label} color={c.color} />;
  };

  // =================================================================
  // UI
  // =================================================================
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={700}>
            Peer Review
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Collaborate with fellow learners and improve together
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab
            value="review-others"
            label={`Review Others (${
              reviews.filter((r) => r.needsReview).length
            })`}
          />
          <Tab
            value="my-submissions"
            label={`My Submissions (${mySubmissions.length})`}
          />
        </Tabs>

        {/* =========================== REVIEW OTHERS =========================== */}
        {activeTab === 'review-others' && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h5" fontWeight={600}>
                Help Others Improve
              </Typography>

              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="react">React</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="algorithms">Algorithms</MenuItem>
                  <MenuItem value="css">CSS</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loading ? (
              <LoadingSpinner message="Loading submissions for review..." />
            ) : (
              <Grid container spacing={3}>
                {filteredReviews.map((review) => (
                  <Grid item xs={12} md={6} key={review.id}>
                    <Card
                      sx={{
                        height: '100%',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-2px)',
                        },
                        transition: '0.2s',
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          mb={1}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {review.authorAvatar}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>
                              {review.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {review.author}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} mb={2}>
                          <Chip size="small" label={review.category} />
                          <Chip
                            size="small"
                            label={review.difficulty}
                            color={getDifficultyColor(review.difficulty)}
                          />
                        </Stack>

                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {review.description}
                        </Typography>

                        <Paper
                          variant="outlined"
                          sx={{ p: 1, fontSize: 12, fontFamily: 'monospace' }}
                        >
                          {review.codeSnippet}
                        </Paper>
                      </CardContent>

                      <CardActions
                        sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {formatTimeAgo(review.submittedAt)} •{' '}
                          {review.reviewsCount}/{review.maxReviews} reviews
                        </Typography>

                        {review.needsReview ? (
                          <Button variant="contained" size="small">
                            Start Review
                          </Button>
                        ) : (
                          <Button variant="outlined" size="small" disabled>
                            Review Complete
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}

                {filteredReviews.length === 0 && (
                  <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                    <Typography variant="h1">📝</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      No submissions available
                    </Typography>
                    <Typography color="text.secondary">
                      Check back later for new submissions to review!
                    </Typography>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        )}

        {/* =========================== MY SUBMISSIONS =========================== */}
        {activeTab === 'my-submissions' && (
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Your Submissions
              </Typography>
              <Button variant="contained">Submit New Work</Button>
            </Stack>

            {loading ? (
              <LoadingSpinner message="Loading your submissions..." />
            ) : (
              <Grid container spacing={3}>
                {mySubmissions.map((s) => (
                  <Grid item xs={12} key={s.id}>
                    <Card sx={{ boxShadow: 3 }}>
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Box>
                            <Typography fontWeight={600}>{s.title}</Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                              <Chip size="small" label={s.category} />
                              <Chip
                                size="small"
                                label={s.difficulty}
                                color={getDifficultyColor(s.difficulty)}
                              />
                              {getStatusChip(s.status)}
                            </Stack>
                          </Box>

                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </Stack>

                        <Stack direction="row" spacing={4} mb={2}>
                          <Stack>
                            <Typography fontWeight={600}>
                              {s.reviewsReceived}
                            </Typography>
                            <Typography variant="caption">Reviews</Typography>
                          </Stack>
                          <Stack>
                            <Typography fontWeight={600}>
                              {s.averageRating}
                            </Typography>
                            <Typography variant="caption">
                              Avg Rating
                            </Typography>
                          </Stack>
                          <Stack>
                            <Typography fontWeight={600}>
                              {formatTimeAgo(s.submittedAt)}
                            </Typography>
                            <Typography variant="caption">Submitted</Typography>
                          </Stack>
                        </Stack>

                        {s.feedback && (
                          <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Latest Feedback:
                            </Typography>
                            <Typography variant="body2">
                              "{s.feedback}"
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Typography variant="caption" fontWeight={600}>
                            Review Progress
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={(s.reviewsReceived / s.maxReviews) * 100}
                            sx={{ height: 8, borderRadius: 1, mt: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {mySubmissions.length === 0 && (
                  <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                    <Typography variant="h1">📤</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      No submissions yet
                    </Typography>
                    <Typography color="text.secondary" mb={2}>
                      Submit your first piece of work to get feedback from
                      peers!
                    </Typography>
                    <Button variant="contained">Submit Your Work</Button>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        )}

        {/* =========================== Tips =========================== */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            💡 Review Tips
          </Typography>

          <Grid>
            {[
              {
                title: 'Be Constructive',
                desc: 'Focus on improvements and give actionable feedback',
              },
              {
                title: 'Be Respectful',
                desc: 'There is a person behind the code — encourage them',
              },
              {
                title: 'Be Specific',
                desc: 'Point out exactly what works and what can be improved',
              },
            ].map((tip) => (
              <Grid item xs={12} sm={6} md={4} key={tip.title}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #673ab7, #512da8)',
                    color: 'white',
                    boxShadow: 4,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" mt={1} sx={{ flexGrow: 1 }}>
                    {tip.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default PeerReviewPage;
