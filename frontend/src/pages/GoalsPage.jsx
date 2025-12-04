import React, { useEffect, useState } from 'react';
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
import { Add as AddIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as Sentry from '@sentry/react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    status: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.goals.getAll();
      const goalsData = res.data?.data ?? res.data ?? [];
      setGoals(goalsData);
      setFilteredGoals(goalsData);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load goals');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();

    const handleProgressUpdate = () => loadGoals();
    window.addEventListener('goal:progress-updated', handleProgressUpdate);
    return () =>
      window.removeEventListener('goal:progress-updated', handleProgressUpdate);
  }, []);

  useEffect(() => {
    let filtered = goals;
    if (filters.category) {
      filtered = filtered.filter(
        (g) => g.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.difficulty) {
      filtered = filtered.filter(
        (g) => g.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    if (filters.status) {
      const isCompleted = filters.status === 'completed';
      filtered = filtered.filter((g) => g.isCompleted === isCompleted);
    }
    if (filters.search) {
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (g.description &&
            g.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    setFilteredGoals(filtered);
  }, [goals, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleGoalSubmit = async (formValues) => {
    try {
      setLoading(true);
      setError('');
      if (editingGoal) {
        await apiService.goals.update(editingGoal.id, formValues);
      } else {
        await apiService.goals.create(formValues);
      }
      setShowForm(false);
      setEditingGoal(null);
      await loadGoals();
      setSuccessMessage('Goal saved successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save goal');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleMarkComplete = async (id) => {
    try {
      setLoading(true);
      const currentGoal = goals.find((g) => g.id === id);
      const newCompletionState = !currentGoal?.isCompleted;
      await apiService.goals.update(id, {
        isCompleted: newCompletionState,
        progressPercentage: newCompletionState
          ? 100
          : currentGoal?.progressPercentage || 0,
      });
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update goal status');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      setLoading(true);
      const currentGoal = goals.find((g) => g.id === id);
      const isPaused = currentGoal?.difficulty === 'paused';

      // Toggle: if paused, resume to Medium; if not paused, pause it
      const newDifficulty = isPaused ? 'Medium' : 'paused';

      await apiService.goals.update(id, { difficulty: newDifficulty });
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update goal status');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await apiService.goals.delete(id);
      await loadGoals();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete goal');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#dbe6ebff', p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">My Learning Goals</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateGoal}
          startIcon={<AddIcon />}
          data-test="create-goal-button"
          sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}
        >
          Create New Goal
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Search Goals"
              fullWidth
              placeholder="Search by title or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              inputProps={{ 'data-test': 'search-goals' }}
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
                inputProps={{ 'data-test': 'goal-filter-category' }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="programming">Programming</MenuItem>
                <MenuItem value="design">Design</MenuItem>
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
                inputProps={{ 'data-test': 'goal-filter-difficulty' }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
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
                inputProps={{ 'data-test': 'goal-filter-status' }}
              >
                <MenuItem value="">All Goals</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Typography sx={{ mb: 2 }}>
        Showing {filteredGoals.length} of {goals.length} goals
      </Typography>

      <Box
        sx={{
          mb: 3,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        }}
      />

      {/* Goals List */}
      {loading ? (
        <LoadingSpinner message="Loading goals..." />
      ) : filteredGoals.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            py: 1,
          }}
        >
          {filteredGoals.map((goal) => (
            <Box key={goal.id} sx={{ flex: '0 0 auto', minWidth: 300 }}>
              <GoalCard
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkComplete={handleMarkComplete}
                onPause={handlePause}
                data-test={`goal-card-${goal.id}`}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">No goals found</Typography>
          <Typography variant="body1" gutterBottom>
            Try adjusting your filters or search terms.
          </Typography>
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({ category: '', difficulty: '', search: '' })
            }
            data-test="clear-goal-filters"
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Goal Form */}
      {showForm && (
        <GoalForm
          onSubmit={handleGoalSubmit}
          onClose={handleFormClose}
          initialGoal={editingGoal}
        />
      )}

      {/* Success message */}
      {successMessage && (
        <Box sx={{ mt: 2 }} data-test="goal-success-message">
          <Typography color="success.main">{successMessage}</Typography>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Box sx={{ mt: 2 }} data-test="goal-error-message">
          <Typography color="error">{error}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default GoalsPage;
