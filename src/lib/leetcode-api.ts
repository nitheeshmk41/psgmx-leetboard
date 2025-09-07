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
 * Calculate submissions in the last 7 days
 */
export const calculateWeeklyProgress = (submissionCalendar: Record<string, number> = {}): number => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  let weeklySubmissions = 0;

  for (const [timestamp, count] of Object.entries(submissionCalendar)) {
    const submissionDate = new Date(parseInt(timestamp) * 1000);
    if (submissionDate >= oneWeekAgo) weeklySubmissions += count;
  }

  return weeklySubmissions;
};
