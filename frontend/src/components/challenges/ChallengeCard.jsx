import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';

const ChallengeCard = ({
  challenge,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onFeedback,
  onViewSubmissions,
}) => {
  const [expanded, setExpanded] = useState(false);
  const difficulty = challenge?.difficulty || 'Medium';
  const status = challenge?.status || null;

  const toggleExpand = () => setExpanded((prev) => !prev);

  const difficultyColor = {
    Easy: '#4CAF50',
    Medium: '#FF9800',
    Hard: '#F44336',
  };

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
      }}
      data-test={`challenge-card-${challenge?.id}`}
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
            {challenge?.title || 'Challenge Title'}
          </Typography>
        </Box>

        {/* Top Right Action Icons */}
        <Stack direction="row" spacing={0.5}>
          {onComplete && (
            <Tooltip
              title={
                challenge?.status === 'completed'
                  ? 'Mark Incomplete'
                  : 'Mark Complete'
              }
            >
              <IconButton
                size="small"
                onClick={() => onComplete(challenge.id)}
                data-test="challenge-mark-complete-btn"
                sx={{
                  color:
                    challenge?.status === 'completed'
                      ? 'success.main'
                      : 'default',
                }}
              >
                {challenge?.status === 'completed' ? (
                  <CheckCircleIcon />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(challenge)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(challenge.id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
            <IconButton onClick={toggleExpand} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Quick Info Chips */}
      <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {challenge?.category && (
          <Chip
            label={
              challenge.category.charAt(0).toUpperCase() +
              challenge.category.slice(1)
            }
            size="small"
            variant="outlined"
          />
        )}
        <Chip
          label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          size="small"
          sx={{
            backgroundColor: difficultyColor[difficulty] || '#FF9800',
            color: 'white',
          }}
        />
        {typeof challenge?.highestScore === 'number' ? (
          <Chip
            label={`Best: ${challenge.highestScore}/100`}
            size="small"
            color="info"
          />
        ) : (
          status && (
            <Chip
              label={status
                .replace(/_/g, ' ')
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              size="small"
              color={status === 'completed' ? 'success' : 'warning'}
            />
          )
        )}
      </Box>

      {/* Main Content */}
      <CardContent sx={{ p: 2, pb: 1, flex: 1 }}>
        <Stack spacing={1}>
          {challenge?.estimatedTimeMinutes && (
            <Typography variant="body2" color="text.secondary">
              ⏱️ {challenge.estimatedTimeMinutes} min
            </Typography>
          )}
          {challenge?.maxAttempts && (
            <Typography variant="body2" color="text.secondary">
              🎯 Max attempts: {challenge.maxAttempts}
            </Typography>
          )}

          {challenge?.pointsReward && (
            <Typography variant="body2" color="text.secondary">
              ⭐ Reward: {challenge.pointsReward} Points
            </Typography>
          )}

          {/* Collapsible Description */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1 }}>
              {challenge?.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {challenge.description}
                </Typography>
              )}

              {challenge?.instructions && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Instructions:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {challenge.instructions}
                  </Typography>
                </Box>
              )}

              {typeof challenge?.highestScore === 'number' && (
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mt: 1 }}
                >
                  🏆 Best Score: {challenge.highestScore}/100
                </Typography>
              )}

              {typeof challenge?.goalId === 'number' && (
                <Box sx={{ mt: 1 }}>
                  <Link to={`/goals/${challenge.goalId}`}>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ textDecoration: 'underline' }}
                    >
                      View Goal
                    </Typography>
                  </Link>
                </Box>
              )}
            </Box>
          </Collapse>
        </Stack>
      </CardContent>

      {/* Action Buttons */}
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-start', gap: 1 }}>
        {onStart && (
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => onStart(challenge)}
            sx={{ textTransform: 'none' }}
          >
            Start
          </Button>
        )}
        {onFeedback && (
          <Tooltip title="Submit for Feedback">
            <IconButton size="small" onClick={() => onFeedback(challenge)}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onViewSubmissions && (
          <Tooltip title="View Submissions">
            <IconButton
              size="small"
              onClick={() => onViewSubmissions(challenge)}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default ChallengeCard;
