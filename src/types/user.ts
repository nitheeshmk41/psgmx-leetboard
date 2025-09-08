export interface User {
  id: string;
  leetcodeUsername: string;
  displayName: string;
  group: 'G1' | 'G2';
  addedAt: Date;
  lastUpdated?: Date;
  rollNo: string;
}

export interface UserWithStats extends User {
  stats?: {
    totalSolved: number;
    weeklyProgress: number;
    ranking: number;
    acceptanceRate: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
}