// TODO: Implement leaderboard and rankings page
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const { user } = useAuth();

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockLeaderboardData = [
      {
        id: 1,
        rank: 1,
        name: 'Alex Johnson',
        avatar: '👨‍💻',
        points: 2450,
        level: 8,
        completedChallenges: 45,
        isCurrentUser: false
      },
      {
        id: 2,
        rank: 2,
        name: 'Sarah Kim',
        avatar: '👩‍🎨',
        points: 2380,
        level: 8,
        completedChallenges: 42,
        isCurrentUser: false
      },
      {
        id: 3,
        rank: 3,
        name: 'Mike Chen',
        avatar: '👨‍🔬',
        points: 2290,
        level: 7,
        completedChallenges: 38,
        isCurrentUser: false
      },
      {
        id: 4,
        rank: 4,
        name: 'Emma Rodriguez',
        avatar: '👩‍💼',
        points: 2150,
        level: 7,
        completedChallenges: 35,
        isCurrentUser: false
      },
      {
        id: 5,
        rank: 5,
        name: user?.firstName + ' ' + user?.lastName || 'You',
        avatar: '👤',
        points: 1850,
        level: 6,
        completedChallenges: 28,
        isCurrentUser: true
      },
      {
        id: 6,
        rank: 6,
        name: 'David Park',
        avatar: '👨‍🎓',
        points: 1720,
        level: 6,
        completedChallenges: 25,
        isCurrentUser: false
      },
      {
        id: 7,
        rank: 7,
        name: 'Lisa Zhang',
        avatar: '👩‍🔧',
        points: 1650,
        level: 5,
        completedChallenges: 23,
        isCurrentUser: false
      }
    ];

    setTimeout(() => {
      setLeaderboardData(mockLeaderboardData);
      setLoading(false);
    }, 1000);
  }, [timeframe, category, user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const currentUserRank = leaderboardData.find(user => user.isCurrentUser)?.rank || 0;

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>See how you compare with other learners</p>
      </div>

      <div className="leaderboard-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="timeframe">Timeframe</label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="all-time">All Time</option>
              <option value="this-month">This Month</option>
              <option value="this-week">This Week</option>
              <option value="today">Today</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="overall">Overall Points</option>
              <option value="challenges">Challenges Completed</option>
              <option value="goals">Goals Achieved</option>
              <option value="streak">Learning Streak</option>
            </select>
          </div>
        </div>
      </div>

      {currentUserRank > 0 && (
        <div className="user-rank-summary">
          <div className="rank-card current-user">
            <h3>Your Ranking</h3>
            <div className="rank-info">
              <span className="rank-number">#{currentUserRank}</span>
              <div className="rank-details">
                <p>You're in the top {Math.round((currentUserRank / leaderboardData.length) * 100)}% of learners!</p>
                <small>Keep learning to climb higher!</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-content">
        {loading ? (
          <LoadingSpinner message="Loading leaderboard..." />
        ) : (
          <>
            <div className="podium-section">
              <h2>Top Performers</h2>
              <div className="podium">
                {leaderboardData.slice(0, 3).map((user, index) => (
                  <div key={user.id} className={`podium-position position-${index + 1}`}>
                    <div className="podium-user">
                      <div className="user-avatar">{user.avatar}</div>
                      <h4>{user.name}</h4>
                      <p>{user.points} points</p>
                      <span className="level-badge">Level {user.level}</span>
                    </div>
                    <div className="podium-rank">
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="full-rankings">
              <h2>Complete Rankings</h2>
              <div className="rankings-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-user">User</div>
                  <div className="col-points">Points</div>
                  <div className="col-level">Level</div>
                  <div className="col-challenges">Challenges</div>
                </div>

                {leaderboardData.map((user) => (
                  <div 
                    key={user.id} 
                    className={`table-row ${user.isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="col-rank">
                      <span className="rank-icon">{getRankIcon(user.rank)}</span>
                    </div>
                    <div className="col-user">
                      <div className="user-info">
                        <span className="user-avatar">{user.avatar}</span>
                        <span className="user-name">
                          {user.name}
                          {user.isCurrentUser && <small> (You)</small>}
                        </span>
                      </div>
                    </div>
                    <div className="col-points">
                      <strong>{user.points.toLocaleString()}</strong>
                    </div>
                    <div className="col-level">
                      <span className="level-badge">Level {user.level}</span>
                    </div>
                    <div className="col-challenges">
                      {user.completedChallenges}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="achievements-section">
              <h2>Top Achievements This Week</h2>
              <div className="achievements-grid">
                <div className="achievement-card">
                  <div className="achievement-icon">🚀</div>
                  <h4>Challenge Master</h4>
                  <p>Completed 5 challenges in one day</p>
                  <small>Earned by Alex Johnson</small>
                </div>

                <div className="achievement-card">
                  <div className="achievement-icon">🔥</div>
                  <h4>Streak Legend</h4>
                  <p>30-day learning streak</p>
                  <small>Earned by Sarah Kim</small>
                </div>

                <div className="achievement-card">
                  <div className="achievement-icon">🎯</div>
                  <h4>Goal Crusher</h4>
                  <p>Completed 3 learning goals</p>
                  <small>Earned by Mike Chen</small>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;