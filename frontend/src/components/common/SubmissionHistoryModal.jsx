import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { apiService } from '../../services/api';
import * as Sentry from '@sentry/react';

export default function SubmissionHistoryModal({ open, onClose, challenge }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && challenge?.id) {
      fetchSubmissions();
    }
  }, [open, challenge]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await apiService.submissions.getChallengeSubmissions(
        challenge.id
      );
      setSubmissions(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setSubmissions([]);
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Submission History
        {challenge && (
          <Typography variant="subtitle2" color="text.secondary">
            {challenge.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : submissions.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No submissions yet
          </Typography>
        ) : (
          <Stack spacing={2}>
            {submissions.map((submission, idx) => (
              <Accordion
                key={submission.id}
                defaultExpanded={idx === submissions.length - 1}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    <Typography fontWeight="bold">
                      {submission.status === 'draft' ||
                      submission.attemptNumber === 0
                        ? 'Draft'
                        : `Attempt ${submission.attemptNumber || idx + 1}`}
                    </Typography>
                    <Chip
                      label={submission.status || 'submitted'}
                      size="small"
                      color={
                        submission.status === 'graded'
                          ? 'success'
                          : submission.status === 'draft'
                          ? 'default'
                          : 'info'
                      }
                    />
                    {submission.score !== null &&
                      submission.score !== undefined && (
                        <Chip
                          label={`Score: ${submission.score}`}
                          size="small"
                          color="primary"
                        />
                      )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 'auto' }}
                    >
                      {formatDate(
                        submission.submittedAt || submission.createdAt
                      )}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {/* Submission Text */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Your Submission:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        p: 1,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      {submission.submissionText || 'No content'}
                    </Typography>
                  </Box>

                  {/* AI Feedback */}
                  {submission.ai_feedback &&
                    submission.ai_feedback.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          AI Feedback:
                        </Typography>

                        {submission.ai_feedback.map((feedback) => (
                          <Box key={feedback.id} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {feedback.feedbackText}
                            </Typography>

                            {feedback.strengths &&
                              feedback.strengths.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    color="success.main"
                                  >
                                    Strengths:
                                  </Typography>
                                  <ul
                                    style={{
                                      margin: '4px 0',
                                      paddingLeft: '20px',
                                    }}
                                  >
                                    {feedback.strengths.map((s, i) => (
                                      <li key={i}>
                                        <Typography variant="caption">
                                          {s}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                            {feedback.improvements &&
                              feedback.improvements.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    color="warning.main"
                                  >
                                    Areas to Improve:
                                  </Typography>
                                  <ul
                                    style={{
                                      margin: '4px 0',
                                      paddingLeft: '20px',
                                    }}
                                  >
                                    {feedback.improvements.map((i, idx) => (
                                      <li key={idx}>
                                        <Typography variant="caption">
                                          {i}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                            {feedback.suggestions &&
                              feedback.suggestions.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    color="info.main"
                                  >
                                    Suggestions:
                                  </Typography>
                                  <ul
                                    style={{
                                      margin: '4px 0',
                                      paddingLeft: '20px',
                                    }}
                                  >
                                    {feedback.suggestions.map((s, i) => (
                                      <li key={i}>
                                        <Typography variant="caption">
                                          {s}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              {formatDate(feedback.createdAt)}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}

                  {/* Manual Feedback */}
                  {submission.feedback && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Manual Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {submission.feedback}
                      </Typography>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
