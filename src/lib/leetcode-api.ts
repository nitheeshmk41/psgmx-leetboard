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
export const calculateWeeklyProgress = (submissionCalendar: Record<string, number> = {}): number => {
  const now = new Date();

  // Find the most recent Sunday (start of this week)
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const diffToSunday = day; // how many days passed since last Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0); // midnight
  startOfWeek.setDate(now.getDate() - diffToSunday);

  // End of this week (Saturday 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let weeklySubmissions = 0;

  for (const [timestamp, count] of Object.entries(submissionCalendar)) {
    const submissionDate = new Date(parseInt(timestamp) * 1000);
    if (submissionDate >= startOfWeek && submissionDate <= endOfWeek) {
      weeklySubmissions += count;
    }
  }

  return weeklySubmissions;
};

