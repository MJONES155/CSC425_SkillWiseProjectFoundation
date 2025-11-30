import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { apiService } from '../../services/api';
import * as Sentry from '@sentry/react';

export default function AIFeedbackForm({ challenge, onClose, onSuccess }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hints, setHints] = useState([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  useEffect(() => {
    if (challenge?.id) {
      fetchSubmissionCount();
      fetchDrafts();
      setMaxAttempts(challenge.maxAttempts || null);
    }
  }, [challenge]);

  const fetchSubmissionCount = async () => {
    try {
      const res = await apiService.submissions.getChallengeSubmissions(
        challenge.id
      );
      const submissions = res.data?.data || [];
      // Only count non-draft submissions (attemptNumber > 0)
      const count = submissions.filter((s) => s.attemptNumber > 0).length;
      setSubmissionCount(count);
    } catch (err) {
      console.error('Failed to fetch submission count:', err);
      Sentry.captureException(err);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await apiService.submissions.getChallengeSubmissions(
        challenge.id
      );
      const submissions = res.data?.data || [];
      const draftList = submissions.filter(
        (s) => s.status === 'draft' && s.attemptNumber === 0
      );
      setDrafts(draftList);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      Sentry.captureException(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (maxAttempts && submissionCount >= maxAttempts) {
      setFeedback(
        `Maximum attempts (${maxAttempts}) reached for this challenge.`
      );
      return;
    }

    setLoading(true);

    try {
      let payload; // can be FormData or JSON
      const trimmedContent = content.trim();
      const hasFiles = files && files.length > 0;

      if (hasFiles) {
        const formData = new FormData();
        formData.append('challengeId', challenge?.id);
        if (selectedDraftId) {
          formData.append('draftId', selectedDraftId); // Convert draft to real submission
        }
        if (trimmedContent) {
          formData.append('content', trimmedContent); // optional extra textual context
        }
        files.forEach((f) => formData.append('files', f));
        payload = formData;
      } else {
        payload = { challengeId: challenge?.id, content: trimmedContent };
        if (selectedDraftId) {
          payload.draftId = selectedDraftId; // Convert draft to real submission
        }
      }

      // Use longer-timeout feedback to avoid client-side timeouts
      const res = await apiService.ai.feedbackLong(payload);
      const fb = res.data?.feedback || res.data?.feedbackText || res.data;
      setFeedback(typeof fb === 'string' ? fb : JSON.stringify(fb, null, 2));

      await fetchSubmissionCount();

      // Dispatch global event to refresh goals across all pages
      window.dispatchEvent(
        new CustomEvent('goal:progress-updated', {
          detail: {
            challengeId: challenge?.id,
            submissionId: res.data?.submissionId,
            score: res.data?.score,
          },
        })
      );

      if (typeof onSuccess === 'function') {
        try {
          await onSuccess({
            challengeId: challenge?.id,
            submissionId: res.data?.submissionId,
            score: res.data?.score,
          });
        } catch (cbErr) {
          console.warn('onSuccess callback failed:', cbErr);
          Sentry.captureException(cbErr);
        }
      }

      setContent('');
      setFiles([]);
      setSelectedDraftId(null);
      await fetchDrafts(); // Refresh draft list
    } catch (err) {
      console.error(err);
      const isTimeout = err.code === 'ECONNABORTED';
      const errorMsg =
        err.response?.data?.message ||
        (isTimeout
          ? 'Request timed out. Checking if feedback completed…'
          : 'Error submitting content.');
      setFeedback(`Error: ${errorMsg}`);

      // Refresh drafts list in case of error (draft may have been reverted)
      await fetchDrafts();
      await fetchSubmissionCount();

      // Fallback: poll submissions for a short period to surface delayed feedback
      if (isTimeout && challenge?.id) {
        try {
          const pollStart = Date.now();
          const pollForFeedback = async () => {
            const res = await apiService.submissions.getChallengeSubmissions(
              challenge.id
            );
            const items = res.data?.data || res.data || [];
            const latest = items.sort(
              (a, b) => (b.attemptNumber || 0) - (a.attemptNumber || 0)
            )[0];
            const latestFeedback =
              latest?.ai_feedback?.[0]?.feedbackText || latest?.feedbackText;
            if (latestFeedback) {
              setFeedback(latestFeedback);
              await fetchSubmissionCount();

              // Dispatch global event to refresh goals
              window.dispatchEvent(
                new CustomEvent('goal:progress-updated', {
                  detail: {
                    challengeId: challenge?.id,
                    submissionId: latest?.id,
                    score: latest?.score,
                  },
                })
              );

              if (typeof onSuccess === 'function') {
                try {
                  await onSuccess({
                    challengeId: challenge?.id,
                    submissionId: latest?.id,
                    score: latest?.score,
                  });
                } catch (err) {
                  console.warn('onSuccess handler failed', err);
                }
              }
              return true;
            }
            return false;
          };

          const interval = 2000; // 2s
          const timeout = 20000; // 20s total polling
          const tick = async () => {
            const found = await pollForFeedback();
            if (found) return;
            if (Date.now() - pollStart < timeout) {
              setTimeout(tick, interval);
            }
          };
          tick();
        } catch (pollErr) {
          console.warn('Polling for delayed feedback failed:', pollErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetHints = async () => {
    try {
      setHintsLoading(true);
      const res = await apiService.ai.getHints(challenge.id);
      const data = res.data?.data ?? res.data;
      const list = data?.hints || data?.hints?.hints || [];
      setHints(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to get hints:', err);
    } finally {
      setHintsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const trimmedContent = content.trim();
      const payload = {
        challengeId: challenge?.id,
        content: trimmedContent,
        draft: true,
      };
      const res = await apiService.ai.feedback(payload);
      const msg = res.data?.message || 'Draft saved.';
      setFeedback(msg);
      await fetchDrafts(); // Refresh draft list
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error saving draft.';
      setFeedback(`Error: ${errorMsg}`);
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDraft = (draftId) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setContent(draft.submissionText || '');
      setSelectedDraftId(draftId);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
      {/* Challenge info */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Submit Work for Feedback
      </Typography>

      {challenge && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Challenge: {challenge.title}
          </Typography>
          {challenge.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, whiteSpace: 'pre-line' }}
            >
              {challenge.description}
            </Typography>
          )}
          {maxAttempts && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Attempts: {submissionCount} / {maxAttempts}
            </Typography>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Saved Drafts */}
      {drafts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Saved Drafts:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {drafts.map((draft) => (
              <Button
                key={draft.id}
                size="small"
                variant={
                  selectedDraftId === draft.id ? 'contained' : 'outlined'
                }
                onClick={() => handleLoadDraft(draft.id)}
                sx={{ mb: 1 }}
              >
                Draft {new Date(draft.createdAt).toLocaleDateString()}
              </Button>
            ))}
          </Stack>
          {selectedDraftId && (
            <Typography variant="caption" color="primary">
              Draft loaded. Submit to convert to real attempt.
            </Typography>
          )}
        </Box>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="subtitle2">
            Paste text or upload a file:
          </Typography>

          {/* Text input */}
          <TextField
            label="Paste your work"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            minRows={5}
            fullWidth
          />

          {/* File input */}
          <Button variant="outlined" component="label">
            Upload File
            <input
              hidden
              multiple
              type="file"
              accept=".js"
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </Button>

          {files && files.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Selected: {files.map((f) => f.name).join(', ')}
            </Typography>
          )}

          {/* Submit button */}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Submitting...' : 'Get AI Feedback'}
          </Button>

          {/* Action buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              disabled={hintsLoading}
              onClick={handleGetHints}
            >
              {hintsLoading ? 'Getting Hints...' : 'Get AI Hint'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Feedback Response */}
      {feedback && (
        <Paper
          sx={{
            mt: 3,
            p: 2,
            background: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">AI Feedback:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
            {feedback}
          </Typography>
        </Paper>
      )}

      {/* Hints */}
      {hints && hints.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, background: '#eef6ff', borderRadius: 2 }}>
          <Typography variant="h6">Hints:</Typography>
          {hints.map((h, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
              • {h}
            </Typography>
          ))}
        </Paper>
      )}

      {/* Close button */}
      <Button onClick={onClose} sx={{ mt: 2 }} fullWidth variant="outlined">
        Close
      </Button>
    </Paper>
  );
}
