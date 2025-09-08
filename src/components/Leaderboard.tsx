import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useFirestore';
import { fetchLeetCodeStats, calculateWeeklyProgress } from '@/lib/leetcode-api';
import { UserWithStats } from '@/types/user';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Trophy, Medal, Award, Filter, Users, TrendingUp, Target } from 'lucide-react';
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
        if (stats) {
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
        }
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
    usersWithStatsData.sort((a, b) => {
  const weeklyA = a.stats?.weeklyProgress || 0;
  const weeklyB = b.stats?.weeklyProgress || 0;

  if (weeklyB !== weeklyA) {
    return weeklyB - weeklyA; // Higher weekly progress first
  }

  const totalA = a.stats?.totalSolved || 0;
  const totalB = b.stats?.totalSolved || 0;
  return totalB - totalA; // Tie-breaker: higher total solved first
});

setUsersWithStats(usersWithStatsData);
setStatsLoading(false);
  };

  const filteredUsers = usersWithStats.filter(user => filter === 'all' ? true : user.group === filter);

  // Pagination logic
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0: return { icon: '👑', class: 'text-yellow-400' };
      case 1: return { icon: '🥈', class: 'text-gray-400' };
      case 2: return { icon: '🥉', class: 'text-amber-600' };
      default: return { icon: `${index + 1}`, class: 'text-gray-400' };
    }
  };

  const getUserCardClass = (index: number) => {
    const baseClass = 'border border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800/70 transition-all duration-200 ease-in-out cursor-pointer';

    if (index === 0) return `${baseClass} ring-1 ring-yellow-400/30`;
    if (index === 1) return `${baseClass} ring-1 ring-gray-400/30`;
    if (index === 2) return `${baseClass} ring-1 ring-amber-600/30`;
    return baseClass;
  };

  const getGroupStats = (group: 'G1' | 'G2') => {
    const groupUsers = usersWithStats.filter(user => user.group === group);
    const totalSolved = groupUsers.reduce((sum, user) => sum + (user.stats?.totalSolved || 0), 0);
    const weeklyProgress = groupUsers.reduce((sum, user) => sum + (user.stats?.weeklyProgress || 0), 0);

    const weeklyTop = groupUsers.reduce((prev, curr) => (curr.stats?.weeklyProgress || 0) > (prev.stats?.weeklyProgress || 0) ? curr : prev, groupUsers[0]);
    const overallTop = groupUsers.reduce((prev, curr) => (curr.stats?.totalSolved || 0) > (prev.stats?.totalSolved || 0) ? curr : prev, groupUsers[0]);

    return { count: groupUsers.length, totalSolved, weeklyProgress, weeklyTop, overallTop };
  };

  const getAllStats = () => {
    const totalSolved = usersWithStats.reduce((sum, user) => sum + (user.stats?.totalSolved || 0), 0);
    const weeklyProgress = usersWithStats.reduce((sum, user) => sum + (user.stats?.weeklyProgress || 0), 0);

    const weeklyTop = usersWithStats.reduce((prev, curr) => (curr.stats?.weeklyProgress || 0) > (prev.stats?.weeklyProgress || 0) ? curr : prev, usersWithStats[0]);
    const overallTop = usersWithStats.reduce((prev, curr) => (curr.stats?.totalSolved || 0) > (prev.stats?.totalSolved || 0) ? curr : prev, usersWithStats[0]);

    return { count: usersWithStats.length, totalSolved, weeklyProgress, weeklyTop, overallTop };
  };

  const g1Stats = getGroupStats('G1');
  const g2Stats = getGroupStats('G2');
  const allStats = getAllStats();

  return (
    <div className="">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">LeetCode Leaderboard</h1>
          <p className="text-gray-400">Track your competitive programming progress</p>
        </div>

        {/* Overall Stats */}
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Overall Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">{allStats.count}</div>
                <div className="text-sm text-gray-400">Total Students</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Target className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold text-white">{allStats.totalSolved}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-white">{allStats.weeklyProgress}</div>
                <div className="text-sm text-gray-400">Weekly Progress</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Medal className="h-6 w-6 mx-auto mb-2 text-orange-400" />
                <div className="text-lg font-bold text-white">{allStats.weeklyTop?.displayName || '-'}</div>
                <div className="text-sm text-gray-400">Weekly Leader</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { stats: g1Stats, name: 'G1', color: 'blue' },
            { stats: g2Stats, name: 'G2', color: 'purple' }
          ].map(({ stats, name, color }) => (
            <Card key={name} className="bg-gray-900/90 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                    <span>Group {name}</span>
                    <Badge 
                      variant="outline" 
                      className={`${color === 'blue' ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'} bg-transparent`}
                    >
                      {stats.count} members
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Total Solved</div>
                    <div className="text-xl font-bold text-white">{stats.totalSolved}</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Weekly Progress</div>
                    <div className={`text-xl font-bold ${color === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {stats.weeklyProgress}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-800/20 rounded border border-gray-700">
                    <span className="text-sm text-gray-300">Weekly Top</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{stats.weeklyTop?.displayName || '-'}</span>
                      <Trophy className="h-4 w-4 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800/20 rounded border border-gray-700">
                    <span className="text-sm text-gray-300">Overall Top</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{stats.overallTop?.displayName || '-'}</span>
                      <Award className="h-4 w-4 text-orange-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Update Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Updates reflect within 5 minutes of LeetCode submission
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => {setFilter('all'); setCurrentPage(1);}}
            className={`${filter === 'all' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            All Students
          </Button>
          <Button 
            variant={filter === 'G1' ? 'default' : 'outline'}
            onClick={() => {setFilter('G1'); setCurrentPage(1);}}
            className={`${filter === 'G1' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500'
            }`}
          >
            G1
          </Button>
          <Button 
            variant={filter === 'G2' ? 'default' : 'outline'}
            onClick={() => {setFilter('G2'); setCurrentPage(1);}}
            className={`${filter === 'G2' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
              : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500'
            }`}
          >
            G2
          </Button>
        </div>

        {/* Leaderboard */}
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Weekly Leaderboard
              {filter !== 'all' && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${filter === 'G1' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-purple-500 text-purple-400'
                  } bg-transparent`}
                >
                  {filter}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || statsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-700" />
                      <Skeleton className="h-3 w-24 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No students found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedUsers.map((user, index) => {
                  const globalIndex = startIndex + index;
                  const rankDisplay = getRankDisplay(globalIndex);
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${getUserCardClass(globalIndex)} hover:transform hover:scale-[1.01]`}
                      onClick={() => {setSelectedUser(user); setIsModalOpen(true);}}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800 border border-gray-700">
                        <span className={`text-lg font-bold ${rankDisplay.class}`}>
                          {rankDisplay.icon}
                        </span>
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-11 w-11 border-2 border-gray-600">
                        <AvatarFallback className="bg-gray-700 text-white font-medium">
                          {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      
                          <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {user.displayName}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${user.group === 'G1' 
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10' 
                        : 'border-purple-500 text-purple-400 bg-purple-500/10'
                      }`}
                    >
                      {user.group}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    Roll No: {user.rollNo} • @{user.leetcodeUsername}
                  </p>
                </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            {user.stats?.weeklyProgress || 0}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Weekly
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">
                            {user.stats?.totalSolved || 0}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Total
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} students
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 mx-2">
                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
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
    </div>
  );
};