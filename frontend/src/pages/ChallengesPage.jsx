import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeForm from '../components/challenges/ChallengeForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIGenerateChallengeModal from '../components/common/aiChallengeModal';
import AIFeedbackForm from '../components/common/aiFeedbackForm';
import SubmissionHistoryModal from '../components/common/SubmissionHistoryModal';
import Dialog from '@mui/material/Dialog';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { apiService } from '../services/api';
import * as Sentry from '@sentry/react';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChallenge, setAiChallenge] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    status: '',
  });

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.challenges.getAll();
      const challengesData = res.data?.data ?? res.data ?? [];
      setChallenges(challengesData);
      setFilteredChallenges(challengesData);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load challenges.');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const res = await apiService.goals.getAll();
      const goalsData = res.data?.data ?? res.data ?? [];
      setGoals(goalsData);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  useEffect(() => {
    loadChallenges();
    loadGoals();
  }, []);

  useEffect(() => {
    let filtered = challenges;
    if (filters.category) {
      filtered = filtered.filter(
        (c) => c.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.difficulty) {
      filtered = filtered.filter(
        (c) => c.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (c) => c.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    if (filters.search) {
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.tags?.some((tag) =>
            tag.toLowerCase().includes(filters.search.toLowerCase())
          )
      );
    }
    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setShowForm(true);
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setShowForm(true);
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await apiService.challenges.delete(challengeId);
        await loadChallenges();
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to delete challenge.');
        Sentry.captureException(e);
      }
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      setError('');
      // Find the current challenge to check its status
      const currentChallenge = challenges.find((c) => c.id === challengeId);

      if (currentChallenge?.status === 'completed') {
        // Mark as incomplete by removing completion event
        await apiService.challenges.uncomplete(challengeId);
      } else {
        // Mark as complete
        await apiService.challenges.complete(challengeId);
      }

      await loadChallenges();
    } catch (e) {
      setError(
        e.response?.data?.message || 'Failed to update challenge status.'
      );
      Sentry.captureException(e);
    }
  };

  const handleChallengeSubmit = async (challengeData) => {
    try {
      setError('');
      if (editingChallenge) {
        await apiService.challenges.update(editingChallenge.id, challengeData);
      } else {
        await apiService.challenges.create(challengeData);
      }
      setShowForm(false);
      setEditingChallenge(null);
      await loadChallenges();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save challenge.');
      Sentry.captureException(e);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingChallenge(null);
  };

  const handleGenerateAIChallenge = async () => {
    try {
      setAiLoading(true);
      const params = selectedGoalId ? { goalId: selectedGoalId } : {};
      const res = await apiService.ai.getSuggestions(params);
      setAiChallenge(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate AI challenge.');
      Sentry.captureException(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAIChallenge = async () => {
    if (!aiChallenge) return;
    try {
      const challengeData = {
        ...aiChallenge,
        isAI: true,
      };
      if (selectedGoalId) {
        challengeData.tags = [
          ...(aiChallenge.tags || []),
          `goal:${selectedGoalId}`,
        ];
      }
      await apiService.challenges.create(challengeData);
      setShowAIModal(false);
      setAiChallenge(null);
      setSelectedGoalId(null);
      await loadChallenges();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save challenge.');
      Sentry.captureException(e);
    }
  };

  const handleRegenerateAIChallenge = () => handleGenerateAIChallenge();
  const handleHFAIModal = () => {
    setShowAIModal(true);
    setAiChallenge(null);
    setSelectedGoalId(null);
  };
  const handleOpenFeedback = (challenge) => {
    setSelectedChallenge(challenge);
    setShowFeedbackForm(true);
  };
  const handleViewSubmissions = (challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmissionHistory(true);
  };
  const handleCloseFeedback = () => {
    setSelectedChallenge(null);
    setShowFeedbackForm(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff', p: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Learning Challenges
        </Typography>

        {/* Buttons container */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateChallenge}
            startIcon={<AddIcon />}
            data-test="create-challenge-button"
            sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}
          >
            Create Challenge
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleHFAIModal}
            startIcon={<AutoAwesomeIcon />}
            data-test="ai-challenge-button"
            sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            AI Challenge
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fdecea' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Search Challenges"
              fullWidth
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, description, or tags..."
              inputProps={{ 'data-test': 'search' }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                inputProps={{ 'data-test': 'category' }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="programming">Programming</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="backend">Backend</MenuItem>
                <MenuItem value="data-science">Data Science</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) =>
                  handleFilterChange('difficulty', e.target.value)
                }
                inputProps={{ 'data-test': 'difficulty' }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                inputProps={{ 'data-test': 'status' }}
              >
                <MenuItem value="">All Challenges</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Typography sx={{ mb: 2 }}>
        Showing {filteredChallenges.length} of {challenges.length} challenges
      </Typography>

      <Box
        sx={{
          mb: 3,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading challenges..." />
      ) : filteredChallenges.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2, // add some padding-bottom
            '&::-webkit-scrollbar': { height: 8 }, // optional: custom scrollbar height
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.400',
              borderRadius: 4,
            },
          }}
        >
          {filteredChallenges.map((challenge) => (
            <Box key={challenge.id} sx={{ flex: '0 0 auto', minWidth: 300 }}>
              <ChallengeCard
                challenge={challenge}
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
                onComplete={handleCompleteChallenge}
                onFeedback={handleOpenFeedback}
                onViewSubmissions={handleViewSubmissions}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            No challenges found
          </Typography>
          <Typography variant="body1" gutterBottom>
            Try adjusting your filters or search terms.
          </Typography>
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({ category: '', difficulty: '', search: '' })
            }
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {showForm && (
        <ChallengeForm
          onSubmit={handleChallengeSubmit}
          onClose={handleCloseForm}
          initialChallenge={editingChallenge}
        />
      )}

      {showAIModal && (
        <AIGenerateChallengeModal
          open={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setAiChallenge(null);
            setSelectedGoalId(null);
          }}
          loading={aiLoading}
          challenge={aiChallenge}
          onAccept={handleAcceptAIChallenge}
          onRegenerate={handleRegenerateAIChallenge}
          goals={goals}
          selectedGoalId={selectedGoalId}
          onGoalChange={setSelectedGoalId}
          onGenerate={handleGenerateAIChallenge}
        />
      )}

      <Dialog
        open={showFeedbackForm}
        onClose={handleCloseFeedback}
        fullWidth
        maxWidth="sm"
      >
        <AIFeedbackForm
          challenge={selectedChallenge}
          onClose={handleCloseFeedback}
          onSuccess={async () => {
            try {
              await Promise.all([loadChallenges(), loadGoals()]);
            } catch (e) {
              console.error('Refetch challenges/goals failed:', e);
            }
          }}
        />
      </Dialog>

      <SubmissionHistoryModal
        open={showSubmissionHistory}
        onClose={() => setShowSubmissionHistory(false)}
        challenge={selectedChallenge}
      />
    </Box>
  );
};

export default ChallengesPage;
