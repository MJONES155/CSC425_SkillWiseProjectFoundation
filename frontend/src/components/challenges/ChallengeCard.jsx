import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const ChallengeCard = ({
  challenge,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onFeedback,
  onViewSubmissions,
}) => {
  const difficulty = challenge?.difficulty || 'Medium';
  const status = challenge?.status || null;

  return (
    <Card
      sx={{ maxWidth: 420, mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}
      data-test={`challenge-card-${challenge?.id}`}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
        }}
      >
        <Typography variant="h6" data-test="challenge-title-text">
          {challenge?.title || 'Challenge Title'}
        </Typography>

        <Stack spacing={1} alignItems="flex-end">
          <Chip label={difficulty} color="secondary" size="small" />
          <Chip
            label={`+${challenge?.pointsReward || 10} pts`}
            color="primary"
            size="small"
            variant="outlined"
          />
          {typeof challenge?.highestScore === 'number' ? (
            <Chip
              label={`Best: ${challenge.highestScore}/100`}
              color="primary"
              size="small"
            />
          ) : (
            status && (
              <Chip
                label={status.replace('_', ' ')}
                color={status === 'completed' ? 'success' : 'warning'}
                size="small"
              />
            )
          )}
        </Stack>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 0, mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {challenge?.description || 'Challenge description goes here...'}
        </Typography>

        {/* Instructions */}
        {challenge?.instructions && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Instructions:</Typography>
            <Typography variant="body2" color="text.secondary">
              {challenge.instructions}
            </Typography>
          </Box>
        )}

        {/* Metadata */}
        <Stack spacing={1} sx={{ mb: 1 }}>
          {challenge?.category && (
            <Typography variant="body2">📁 {challenge.category}</Typography>
          )}

          {challenge?.estimatedTimeMinutes && (
            <Typography variant="body2">
              ⏱️ {challenge.estimatedTimeMinutes} min
            </Typography>
          )}

          {challenge?.maxAttempts && (
            <Typography variant="body2">
              🎯 Max attempts: {challenge.maxAttempts}
            </Typography>
          )}

          {challenge?.highestScore !== null &&
            challenge?.highestScore !== undefined && (
              <Typography
                variant="body2"
                fontWeight="bold"
                color="primary.main"
              >
                🏆 Best Score: {challenge.highestScore}/100
              </Typography>
            )}

          {typeof challenge?.goalId === 'number' && (
            <Typography variant="body2">
              <Link to={`/goals/${challenge.goalId}`}>View Goal</Link>
            </Typography>
          )}
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {onStart && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onStart(challenge)}
          >
            Start Challenge
          </Button>
        )}

        {onComplete && challenge?.status !== 'completed' && (
          <Button
            size="small"
            color="success"
            variant="contained"
            onClick={() => onComplete(challenge.id)}
            data-test="challenge-mark-complete-btn"
          >
            Mark Complete
          </Button>
        )}

        {onEdit && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onEdit(challenge)}
          >
            Edit
          </Button>
        )}

        {onDelete && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onDelete(challenge.id)}
          >
            Delete
          </Button>
        )}

        {onFeedback && (
          <Button
            size="small"
            color="info"
            variant="outlined"
            onClick={() => onFeedback(challenge)}
          >
            Submit for Feedback
          </Button>
        )}

        {onViewSubmissions && (
          <Button
            size="small"
            color="secondary"
            variant="text"
            onClick={() => onViewSubmissions(challenge)}
          >
            View Submissions
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ChallengeCard;
