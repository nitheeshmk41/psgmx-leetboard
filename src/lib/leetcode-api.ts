import axios from 'axios';

const LEETCODE_API_BASE = 'https://leetcode-stats-api.herokuapp.com';
const CACHE_KEY = 'leetcode_stats_cache';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export interface LeetCodeStats {
  status: string;
  message: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  submissionCalendar: Record<string, number>;
}

/**
 * Get cached stats if not expired
 */
const getCachedStats = (username: string): LeetCodeStats | null => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  const userCache = cache[username];
  if (!userCache) return null;
  if (Date.now() - userCache.timestamp > CACHE_EXPIRY) return null; // expired
  return userCache.stats;
};

/**
 * Save stats to cache
 */
const setCachedStats = (username: string, stats: LeetCodeStats) => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[username] = { stats, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

/**
 * Fetch stats from API or cache
 */
export const fetchLeetCodeStats = async (username: string): Promise<LeetCodeStats | null> => {
  const cached = getCachedStats(username);
  if (cached) return cached;

  try {
    const response = await axios.get(`${LEETCODE_API_BASE}/${username}`);
    const stats: LeetCodeStats = response.data;
    setCachedStats(username, stats);
    return stats;
  } catch (error) {
    console.error(`Failed to fetch stats for ${username}`, error);
    return null;
  }
};

/**
 * Calculate submissions in the current week (Sunday → Saturday)
 */

const ALFA_API_BASE = 'https://alfa-leetcode-api.onrender.com';

export const fetchWeeklyProgress = async (username: string): Promise<number> => {
  try {
    const response = await axios.get(`${ALFA_API_BASE}/${username}/acSubmission`);
    const submissions = response.data.submission || [];

    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay()); // Sunday 00:00
    sunday.setHours(0, 0, 0, 0);

    let count = 0;
    for (const sub of submissions) {
      const ts = new Date(parseInt(sub.timestamp, 10) * 1000);
      if (ts >= sunday) {
        count++;
      }
    }

    return count;
  } catch (err) {
    console.error(`Failed to fetch weekly submissions for ${username}`, err);
    return 0;
  }
};

