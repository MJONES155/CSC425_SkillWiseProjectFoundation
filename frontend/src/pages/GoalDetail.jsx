import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import ChallengeCard from '../components/challenges/ChallengeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GoalDetail = () => {
  const { id } = useParams();
  const goalId = parseInt(id, 10);
  const [goal, setGoal] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [goalRes, challengesRes] = await Promise.all([
        apiService.goals.getById(goalId),
        apiService.challenges.getAll({ goalId }),
      ]);
      setGoal(goalRes.data?.data ?? goalRes.data ?? null);
      setChallenges(challengesRes.data?.data ?? challengesRes.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(goalId)) return;
    load();
  }, [goalId]);

  const handleCompleteChallenge = async (challengeId) => {
    try {
      await apiService.challenges.complete(challengeId);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete challenge.');
    }
  };

  if (!Number.isInteger(goalId)) {
    return <div className="error-message">Invalid goal ID</div>;
  }

  return (
    <div className="goal-detail-page">
      <div className="page-header">
        <h1>Goal Details</h1>
        <Link className="btn-secondary" to="/goals">
          Back to Goals
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <LoadingSpinner message="Loading goal..." />
      ) : goal ? (
        <>
          <div className="goal-summary">
            <h2>{goal.title}</h2>
            {goal.category && <p>Category: {goal.category}</p>}
            {goal.targetCompletionDate && (
              <p>
                Target Date:{' '}
                {new Date(goal.targetCompletionDate).toLocaleDateString()}
              </p>
            )}
            <div className="goal-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${goal.progressPercentage || 0}%` }}
                ></div>
              </div>
              <span>{goal.progressPercentage || 0}%</span>
            </div>
            {goal.description && <p>{goal.description}</p>}
          </div>

          <h3>Challenges for this goal</h3>
          {challenges.length ? (
            <div className="challenges-grid">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleCompleteChallenge}
                />
              ))}
            </div>
          ) : (
            <p>No challenges linked to this goal yet.</p>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>Goal not found</h3>
        </div>
      )}
    </div>
  );
};

export default GoalDetail;
