import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useFirestore';
import { fetchLeetCodeStats, calculateWeeklyProgress } from '@/lib/leetcode-api';
import { UserWithStats } from '@/types/user';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Trophy, Medal, Award, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'G1' | 'G2';

export const Leaderboard = () => {
  const { users, loading } = useUsers();
  const [usersWithStats, setUsersWithStats] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    if (users.length > 0) {
      loadUserStats();
    }
  }, [users]);


  const loadUserStats = async () => {
    setStatsLoading(true);
    const usersWithStatsData: UserWithStats[] = [];

    for (const user of users) {
      try {
        const stats = await fetchLeetCodeStats(user.leetcodeUsername);
        const weeklyProgress = calculateWeeklyProgress(stats.submissionCalendar || {});
        usersWithStatsData.push({
          ...user,
          stats: {
            totalSolved: stats.totalSolved,
            weeklyProgress,
            ranking: stats.ranking,
            acceptanceRate: stats.acceptanceRate,
            easySolved: stats.easySolved,
            mediumSolved: stats.mediumSolved,
            hardSolved: stats.hardSolved,
          },
        });
      } catch {
        usersWithStatsData.push({
          ...user,
          stats: {
            totalSolved: 0,
            weeklyProgress: 0,
            ranking: 0,
            acceptanceRate: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
          },
        });
      }
    }

    // Sort by weekly progress descending
    usersWithStatsData.sort((a, b) => (b.stats?.weeklyProgress || 0) - (a.stats?.weeklyProgress || 0));
    setUsersWithStats(usersWithStatsData);
    setStatsLoading(false);
  };

  const filteredUsers = usersWithStats.filter(user => filter === 'all' ? true : user.group === filter);

  // Pagination logic
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const getRankEmoji = (index: number) => {
    switch(index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

 const getUserCardClass = (index: number) => {
  if (index === 0)
    return 'bg-yellow-600/30 text-yellow-100 hover:bg-yellow-600/50 shadow-md transform hover:scale-[1.02] transition-all';
  if (index === 1)
    return 'bg-gray-600/30 text-gray-100 hover:bg-gray-600/50 shadow-md transform hover:scale-[1.02] transition-all';
  if (index === 2)
    return 'bg-amber-600/30 text-amber-100 hover:bg-amber-600/50 shadow-md transform hover:scale-[1.02] transition-all';
  return 'bg-background/70 text-white hover:bg-background/50 hover:shadow-sm transform hover:scale-[1.01] transition-all';
};


  const getGroupStats = (group: 'G1' | 'G2') => {
    const groupUsers = usersWithStats.filter(user => user.group === group);
    const totalSolved = groupUsers.reduce((sum, user) => sum + (user.stats?.totalSolved || 0), 0);
    const weeklyProgress = groupUsers.reduce((sum, user) => sum + (user.stats?.weeklyProgress || 0), 0);

    const weeklyTop = groupUsers.reduce((prev, curr) => (curr.stats?.weeklyProgress || 0) > (prev.stats?.weeklyProgress || 0) ? curr : prev, groupUsers[0]);
    const overallTop = groupUsers.reduce((prev, curr) => (curr.stats?.totalSolved || 0) > (prev.stats?.totalSolved || 0) ? curr : prev, groupUsers[0]);

    return { count: groupUsers.length, totalSolved, weeklyProgress, weeklyTop, overallTop };
  };

  const g1Stats = getGroupStats('G1');
  const g2Stats = getGroupStats('G2');

  return (
    <div className="space-y-6">
      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{stats: g1Stats, name: 'G1'}, {stats: g2Stats, name: 'G2'}].map(({stats, name}, idx) => (
          <Card key={name} className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? 'default' : 'secondary'} className="px-3 py-1">{name}</Badge>
                    <span>MXians</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{stats.count}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Weekly Top: </span> {stats.weeklyTop?.displayName || '-'} 🏅
                  <span className="ml-4 font-semibold">Overall Top: </span> {stats.overallTop?.displayName || '-'} 🌟
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Solved</span>
                  <span className="font-semibold">{stats.totalSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Progress</span>
                  <span className="font-semibold text-primary">{stats.weeklyProgress}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        <div className="text-sm text-yellow-400 mb-2 text-center">
  If you added a new code to LeetCode, check again after 5 mins for updates.
</div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant={filter === 'all' ? 'default' : 'group'} onClick={() => {setFilter('all'); setCurrentPage(1);}}>All Students</Button>
        <Button variant={filter === 'G1' ? 'default' : 'group'} onClick={() => {setFilter('G1'); setCurrentPage(1);}}>G1</Button>
        <Button variant={filter === 'G2' ? 'default' : 'group'} onClick={() => {setFilter('G2'); setCurrentPage(1);}}>G2</Button>
      </div>

      {/* Leaderboard */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Weekly Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || statsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12">No students found.</div>
          ) : (
            <div className="space-y-3">
              {paginatedUsers.map((user, index) => {
                const globalIndex = startIndex + index;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border border-border cursor-pointer ${getUserCardClass(globalIndex)}`}
                    onClick={() => {setSelectedUser(user); setIsModalOpen(true);}}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-xl font-bold">
                        {getRankEmoji(globalIndex)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{user.displayName}</h3>
                          <Badge variant={user.group === 'G1' ? 'default' : 'secondary'}>{user.group}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{user.leetcodeUsername}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{user.stats?.weeklyProgress || 0}</div>
                      <div className="text-xs text-muted-foreground">weekly</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{user.stats?.totalSolved || 0}</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</Button>
              <span className="flex items-center gap-1">Page {currentPage} / {totalPages}</span>
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {setIsModalOpen(false); setSelectedUser(null);}}
      />
    </div>
  );
};
