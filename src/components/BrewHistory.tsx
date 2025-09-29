import React, { useState, useEffect, useMemo } from 'react';
import { BrewSession } from '../services/LocalStorageService';
import { formatTime } from '../models';
import { RecommendationEngine } from '../utils/recommendationEngine';
import LocalStorageService from '../services/LocalStorageService';
import TasteProfileSlider from './TasteProfileSlider';

interface BrewHistoryProps {
  onEditSession?: (session: BrewSession) => void;
}

const BrewHistory: React.FC<BrewHistoryProps> = ({ onEditSession }) => {
  const [sessions, setSessions] = useState<BrewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<BrewSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'guide'>('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    try {
      const loadedSessions = LocalStorageService.getBrewSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Failed to load brew sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;

    if (searchTerm) {
      filtered = sessions.filter(session =>
        session.guideSnapshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.metadata.beanOrigin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.metadata.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRating) {
      filtered = filtered.filter(session => session.metadata.overallRating === filterRating);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.metadata.overallRating - a.metadata.overallRating;
        case 'guide':
          return a.guideSnapshot.name.localeCompare(b.guideSnapshot.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchTerm, filterRating, sortBy]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this brew session?')) {
      return;
    }

    try {
      const success = LocalStorageService.deleteBrewSession(sessionId);
      if (success) {
        loadSessions();
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete session');
    }
  };

  const getTasteProfileIndicator = (session: BrewSession): string => {
    const { x, y } = session.metadata.tasteProfile;

    if (RecommendationEngine.isProfileBalanced(session.metadata.tasteProfile)) {
      return '⚖️';
    }

    if (Math.abs(x) > Math.abs(y)) {
      return x > 0.33 ? '😖' : x < -0.33 ? '😬' : '😐';
    } else {
      return y > 0.33 ? '💪' : y < -0.33 ? '💧' : '😐';
    }
  };

  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedSession(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to History
          </button>
          <div className="flex gap-3">
            {onEditSession && (
              <button
                onClick={() => onEditSession(selectedSession)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
              >
                Edit Session
              </button>
            )}
            <button
              onClick={() => handleDeleteSession(selectedSession.id)}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
            >
              Delete Session
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{selectedSession.guideSnapshot.icon}</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedSession.guideSnapshot.name}
              </h1>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= selectedSession.metadata.overallRating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Brewed on {new Date(selectedSession.createdAt).toLocaleDateString()} at{' '}
              {new Date(selectedSession.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recipe</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div>Dose: {selectedSession.metadata.coffeeDose}g</div>
                    <div>Yield: {selectedSession.metadata.finalYield}ml</div>
                    <div>
                      Ratio: 1:{(selectedSession.metadata.finalYield / selectedSession.metadata.coffeeDose).toFixed(1)}
                    </div>
                    <div>
                      Time: {formatTime(selectedSession.guideSnapshot.totalTime)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Parameters</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div>Grind: {selectedSession.guideSnapshot.grindSize}</div>
                    <div>Water: {selectedSession.metadata.waterTemp}°C</div>
                    {selectedSession.metadata.grindSetting && (
                      <div>Setting: {selectedSession.metadata.grindSetting}</div>
                    )}
                    {selectedSession.metadata.beanOrigin && (
                      <div>Bean: {selectedSession.metadata.beanOrigin}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSession.metadata.notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedSession.metadata.notes}
                  </p>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Brewing Steps</h3>
                <div className="space-y-2">
                  {selectedSession.guideSnapshot.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-white">{step.description}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          ({formatTime(step.duration)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <TasteProfileSlider
                value={selectedSession.metadata.tasteProfile}
                onChange={() => {}}
                showRecommendations={true}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Brew History ({sessions.length} sessions)
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by guide name, bean origin, or notes..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>
                {rating} Star{rating !== 1 ? 's' : ''}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'guide')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="guide">Sort by Guide</option>
          </select>
        </div>
      </div>

      {filteredAndSortedSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">☕</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {sessions.length === 0 ? 'No brew sessions yet' : 'No sessions match your filters'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {sessions.length === 0
              ? 'Start brewing and save your first session!'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{session.guideSnapshot.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.guideSnapshot.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatSessionDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-2xl" title="Taste Profile">
                  {getTasteProfileIndicator(session)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span>
                  {session.metadata.coffeeDose}g → {session.metadata.finalYield}ml
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= session.metadata.overallRating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {session.metadata.beanOrigin && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                  <span className="font-medium">Bean:</span> {session.metadata.beanOrigin}
                </p>
              )}

              {session.metadata.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {session.metadata.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrewHistory;