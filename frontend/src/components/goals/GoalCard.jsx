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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { apiService } from '../../services/api';
import ChallengeCard from '../challenges/ChallengeCard';
import ChallengeForm from '../challenges/ChallengeForm';

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
      // Load challenges when expanding for the first time
      setLoadingChallenges(true);
      try {
        const response = await apiService.challenges.getAll({
          goalId: goal.id,
        });
        setChallenges(response.data?.data ?? response.data ?? []);
      } catch (error) {
        console.error('Failed to load challenges:', error);
      } finally {
        setLoadingChallenges(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleChallengeComplete = async (challengeId) => {
    if (onChallengeComplete) {
      await onChallengeComplete(challengeId);
      // Reload challenges to update status
      if (goal?.id) {
        const response = await apiService.challenges.getAll({
          goalId: goal.id,
        });
        setChallenges(response.data?.data ?? response.data ?? []);
      }
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
      // Ensure the created challenge links to this goal
      const payload = {
        ...challengeData,
        goalId: goal?.id || challengeData.goalId,
      };
      await apiService.challenges.create(payload);
      setShowChallengeForm(false);
      // Reload challenges list under this goal
      if (goal?.id) {
        const response = await apiService.challenges.getAll({ goalId: goal.id });
        setChallenges(response.data?.data ?? response.data ?? []);
        // Expand to show the newly created challenge
        if (!expanded) setExpanded(true);
      }
    } catch (e) {
      console.error('Failed to create challenge:', e);
    }
  };

  return (
    <Card
      sx={{ maxWidth: 420, mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}
      data-test={`goal-card-${goal.id}`}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="h6" data-test="goal-title-text">
          {goal?.title || 'Goal Title'}
        </Typography>
        <Chip
          label={goal?.category || 'Category'}
          size="small"
          color="primary"
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 0, mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {goal?.description || 'Goal description goes here...'}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {progress}%
          </Typography>
        </Box>
      </CardContent>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption">
          {goal?.difficulty || 'Medium'}
        </Typography>
        {goal?.targetCompletionDate && (
          <Typography variant="caption">
            Due: {new Date(goal.targetCompletionDate).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <CardActions
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
      >
        {onEdit && (
          <Button size="small" variant="outlined" onClick={() => onEdit(goal)}>
            Edit
          </Button>
        )}
        {onMarkComplete && !goal.isCompleted && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            data-test="goal-mark-completed-btn"
            onClick={() => onMarkComplete(goal.id)}
          >
            Mark Completed
          </Button>
        )}
        {onPause && !goal.isCompleted && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPause(goal.id)}
          >
            Pause
          </Button>
        )}
        {goal.isCompleted && (
          <Chip label="Completed" color="success" size="small" />
        )}
        {onDelete && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onDelete(goal.id)}
          >
            Delete
          </Button>
        )}

        {/* Create Challenge linked to this Goal */}
        {!goal.isCompleted && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={openCreateChallenge}
          >
            Add Challenge
          </Button>
        )}

        {/* Expand/Collapse Button */}
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show challenges"
          size="small"
          sx={{
            marginLeft: 'auto',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>

      {/* Collapsible Challenges Section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Challenges ({challenges.length})
          </Typography>
          {loadingChallenges ? (
            <Typography variant="body2" color="text.secondary">
              Loading challenges...
            </Typography>
          ) : challenges.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleChallengeComplete}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No challenges linked to this goal yet.{' '}
              <Button size="small" onClick={openCreateChallenge}>
                Add one
              </Button>
            </Typography>
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
