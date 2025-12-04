import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import { apiService } from '../../services/api';
import ChallengeCard from '../challenges/ChallengeCard';
import ChallengeForm from '../challenges/ChallengeForm';
import * as Sentry from '@sentry/react';

const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onMarkComplete,
  onPause,
  onChallengeComplete,
}) => {
  const progress = goal?.progressPercentage || 0;
  const [expanded, setExpanded] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  const handleExpandClick = async () => {
    if (!expanded && challenges.length === 0 && goal?.id) {
      setLoadingChallenges(true);
      try {
        const response = await apiService.challenges.getAll({
          goalId: goal.id,
        });
        const loadedChallenges = response.data?.data ?? response.data ?? [];
        console.log(
          `[GoalCard ${goal.id}] Loaded ${loadedChallenges.length} challenges:`,
          loadedChallenges.map((c) => ({
            id: c.id,
            title: c.title,
            goalId: c.goalId,
          }))
        );
        setChallenges(loadedChallenges);
      } catch (error) {
        console.error('Failed to load challenges:', error);
        Sentry.captureException(error);
      } finally {
        setLoadingChallenges(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleChallengeComplete = async (challengeId) => {
    try {
      if (onChallengeComplete) {
        await onChallengeComplete(challengeId);
      } else {
        // If no parent handler, toggle completion directly
        const challenge = challenges.find((c) => c.id === challengeId);
        if (challenge?.status === 'completed') {
          await apiService.challenges.uncomplete(challengeId);
        } else {
          await apiService.challenges.complete(challengeId);
        }
      }
      // Always reload challenges to update status
      if (goal?.id) {
        const response = await apiService.challenges.getAll({
          goalId: goal.id,
        });
        setChallenges(response.data?.data ?? response.data ?? []);
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      Sentry.captureException(error);
    }
  };

  const openCreateChallenge = () => {
    setShowChallengeForm(true);
  };

  const closeCreateChallenge = () => {
    setShowChallengeForm(false);
  };

  const handleChallengeCreate = async (challengeData) => {
    try {
      const payload = {
        ...challengeData,
        // Keep the goalId from the form as-is (could be empty/null for standalone challenges)
      };
      await apiService.challenges.create(payload);
      setShowChallengeForm(false);
      if (goal?.id) {
        const response = await apiService.challenges.getAll({
          goalId: goal.id,
        });
        setChallenges(response.data?.data ?? response.data ?? []);
        if (!expanded) setExpanded(true);
      }
    } catch (e) {
      console.error('Failed to create challenge:', e);
      Sentry.captureException(e);
    }
  };

  const isPaused = goal?.difficulty === 'paused';

  return (
    <Card
      sx={{
        maxWidth: 420,
        minWidth: 400,
        mb: 2,
        borderRadius: 2,
        boxShadow: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
        display: 'flex',
        flexDirection: 'column',
        opacity: goal?.isCompleted ? 0.75 : 1,
      }}
      data-test={`goal-card-${goal.id}`}
    >
      {/* Header with Title and Action Icons */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ flex: 1, pr: 1 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {goal?.title || 'Goal Title'}
          </Typography>
          {goal?.category && (
            <Chip
              label={
                goal.category.charAt(0).toUpperCase() + goal.category.slice(1)
              }
              size="small"
              color="primary"
              variant={goal?.isCompleted ? 'outlined' : 'filled'}
            />
          )}
        </Box>

        {/* Top Right Action Icons */}
        <Stack direction="row" spacing={0.5}>
          {onMarkComplete && (
            <Tooltip
              title={goal?.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            >
              <IconButton
                size="small"
                onClick={() => onMarkComplete(goal.id)}
                data-test="goal-mark-completed-btn"
                sx={{ color: goal?.isCompleted ? 'success.main' : 'default' }}
              >
                {goal?.isCompleted ? (
                  <CheckCircleIcon />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
          {onPause && !goal?.isCompleted && (
            <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
              <IconButton
                size="small"
                onClick={() => onPause(goal.id)}
                sx={{ color: isPaused ? 'warning.main' : 'default' }}
              >
                {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(goal)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(goal.id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
            <IconButton
              onClick={handleExpandClick}
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Content */}
      <CardContent sx={{ p: 2, pb: 1, flex: 1 }}>
        <Stack spacing={1.5}>
          {goal?.description && (
            <Typography variant="body2" color="text.secondary">
              {goal.description}
            </Typography>
          )}

          {/* Progress Bar */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={600} color="primary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ borderRadius: 2, height: 8 }}
            />
          </Box>

          {/* Meta Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Difficulty: {goal?.difficulty}
            </Typography>
            {goal?.targetCompletionDate && (
              <Typography variant="caption" color="text.secondary">
                Due: {new Date(goal.targetCompletionDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>

      {/* Action Buttons */}
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-start', gap: 1 }}>
        {!goal?.isCompleted && (
          <Tooltip title="Add Challenge">
            <IconButton
              size="small"
              onClick={openCreateChallenge}
              color="primary"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>

      {/* Collapsible Challenges Section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography
            variant="subtitle2"
            sx={{ px: 2, mb: 1, fontWeight: 600 }}
          >
            Challenges ({challenges.length})
          </Typography>
          {loadingChallenges ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              Loading challenges...
            </Typography>
          ) : challenges.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                px: 2,
                pb: 2,
              }}
            >
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleChallengeComplete}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No challenges yet.{' '}
                <Button
                  size="small"
                  onClick={openCreateChallenge}
                  sx={{ textTransform: 'none', p: 0 }}
                >
                  Add one
                </Button>
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      {showChallengeForm && (
        <ChallengeForm
          onSubmit={handleChallengeCreate}
          onClose={closeCreateChallenge}
          initialChallenge={null}
          initialGoalId={goal?.id}
        />
      )}
    </Card>
  );
};

export default GoalCard;
