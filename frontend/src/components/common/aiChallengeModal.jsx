import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const AIGenerateChallengeModal = ({
  open,
  onClose,
  loading,
  challenge,
  onAccept,
  onRegenerate,
  goals,
  selectedGoalId,
  onGoalChange,
  onGenerate,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h5" gutterBottom>
          AI-Generated Challenge
        </Typography>

        {!challenge && !loading && (
          <>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="goal-select-label">
                Select a Goal (Optional)
              </InputLabel>
              <Select
                labelId="goal-select-label"
                value={selectedGoalId || ''}
                onChange={(e) => onGoalChange(e.target.value)}
                label="Select a Goal (Optional)"
              >
                <MenuItem value="">
                  <em>No specific goal</em>
                </MenuItem>
                {goals?.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title} ({goal.category || 'General'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={3} display="flex" justifyContent="center">
              <Button variant="contained" onClick={onGenerate}>
                Generate Challenge
              </Button>
            </Box>
          </>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : challenge ? (
          <>
            {/* Title */}
            {challenge.title && (
              <Typography variant="h6" fontWeight="bold">
                {challenge.title}
              </Typography>
            )}

            {/* Description */}
            {challenge.description && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {challenge.description}
              </Typography>
            )}

            {/* Instructions */}
            {challenge.instructions && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Instructions
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {challenge.instructions}
                </Typography>
              </Box>
            )}

            {/* Meta info */}
            <Box sx={{ mt: 2 }}>
              {challenge.difficulty && (
                <Typography color="text.secondary">
                  Difficulty: {challenge.difficulty}
                </Typography>
              )}
              {typeof challenge.estimatedTimeMinutes === 'number' && (
                <Typography color="text.secondary">
                  Est. Time: {challenge.estimatedTimeMinutes} min
                </Typography>
              )}
              {typeof challenge.pointsReward === 'number' && (
                <Typography color="text.secondary">
                  Reward: {challenge.pointsReward} pts
                </Typography>
              )}
            </Box>

            {challenge.tags?.length > 0 && (
              <Typography sx={{ mt: 1 }}>
                Tags: {challenge.tags.join(', ')}
              </Typography>
            )}

            <Box mt={3} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={onRegenerate}>
                Regenerate
              </Button>
              <Button variant="contained" onClick={onAccept}>
                Add Challenge
              </Button>
            </Box>
          </>
        ) : (
          <Typography>No challenge generated yet.</Typography>
        )}
      </Box>
    </Modal>
  );
};

export default AIGenerateChallengeModal;
