// TODO: Implement progress tracking and analytics page
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockProgressData = {
      overall: {
        totalPoints: 450,
        level: 5,
        experiencePoints: 1250,
        nextLevelXP: 1500,
        completedGoals: 8,
        completedChallenges: 15,
        currentStreak: 7,
        longestStreak: 12
      },
      recentActivity: [
        {
          id: 1,
          type: 'challenge_completed',
          title: 'Build a React Component',
          points: 50,
          timestamp: '2025-10-02T10:30:00Z'
        },
        {
          id: 2,
          type: 'goal_progress',
          title: 'Master Frontend Development',
          progress: 75,
          timestamp: '2025-10-02T09:15:00Z'
        },
        {
          id: 3,
          type: 'achievement_earned',
          title: 'First Week Streak',
          points: 25,
          timestamp: '2025-10-01T16:45:00Z'
        }
      ],
      weeklyProgress: [
        { day: 'Mon', points: 30, timeSpent: 45 },
        { day: 'Tue', points: 50, timeSpent: 60 },
        { day: 'Wed', points: 0, timeSpent: 0 },
        { day: 'Thu', points: 75, timeSpent: 90 },
        { day: 'Fri', points: 40, timeSpent: 55 },
        { day: 'Sat', points: 60, timeSpent: 75 },
        { day: 'Sun', points: 35, timeSpent: 40 }
      ],
      skillBreakdown: [
        { skill: 'JavaScript', level: 4, progress: 80 },
        { skill: 'React', level: 3, progress: 65 },
        { skill: 'CSS', level: 5, progress: 90 },
        { skill: 'Node.js', level: 2, progress: 40 },
        { skill: 'Database', level: 3, progress: 55 }
      ]
    };

    setTimeout(() => {
      setProgressData(mockProgressData);
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  if (loading) {
    return <LoadingSpinner message="Loading your progress..." />;
  }

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>Your Learning Progress</h1>
        <p>Track your journey and celebrate your achievements</p>
      </div>

      <div className="progress-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{progressData.overall.totalPoints}</h3>
              <p>Total Points</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Level {progressData.overall.level}</h3>
              <p>Current Level</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(progressData.overall.experiencePoints / progressData.overall.nextLevelXP) * 100}%` 
                  }}
                ></div>
              </div>
              <small>{progressData.overall.experiencePoints}/{progressData.overall.nextLevelXP} XP</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{progressData.overall.completedGoals}</h3>
              <p>Goals Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <h3>{progressData.overall.completedChallenges}</h3>
              <p>Challenges Done</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{progressData.overall.currentStreak}</h3>
              <p>Day Streak</p>
              <small>Longest: {progressData.overall.longestStreak} days</small>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-sections">
        <div className="section-row">
          <div className="progress-chart-section">
            <div className="section-header">
              <h2>Weekly Activity</h2>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="weekly-chart">
              {progressData.weeklyProgress.map((day, index) => (
                <div key={index} className="day-column">
                  <div className="day-label">{day.day}</div>
                  <div 
                    className="day-bar"
                    style={{ height: `${Math.max(day.points / 2, 5)}px` }}
                    title={`${day.points} points, ${day.timeSpent} minutes`}
                  ></div>
                  <div className="day-points">{day.points}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="recent-activity-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {progressData.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'challenge_completed' && '🚀'}
                    {activity.type === 'goal_progress' && '🎯'}
                    {activity.type === 'achievement_earned' && '🏆'}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>
                      {activity.points && `+${activity.points} points`}
                      {activity.progress && `${activity.progress}% complete`}
                    </p>
                    <small>{new Date(activity.timestamp).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="skills-section">
          <h2>Skill Breakdown</h2>
          <div className="skills-grid">
            {progressData.skillBreakdown.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-header">
                  <h4>{skill.skill}</h4>
                  <span className="skill-level">Level {skill.level}</span>
                </div>
                <div className="skill-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{skill.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;