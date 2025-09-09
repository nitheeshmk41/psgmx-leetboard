import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useFirestore';
import { fetchLeetCodeStats, calculateWeeklyProgress } from '@/lib/leetcode-api';
import { UserWithStats } from '@/types/user';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Trophy, Medal, Award, Filter, Users, TrendingUp, Target, Code2, Calendar, Star, Zap, ChevronRight } from 'lucide-react';
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
      case 0: return { icon: '👑', class: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' };
      case 1: return { icon: '🥈', class: 'text-gray-300', bg: 'bg-gray-300/10 border-gray-300/30' };
      case 2: return { icon: '🥉', class: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
      default: return { icon: `${index + 1}`, class: 'text-gray-400', bg: 'bg-gray-600/20 border-gray-600/30' };
    }
  };

  const getUserCardClass = (index: number) => {
    const baseClass = 'group relative bg-gray-900/60 backdrop-blur-sm border hover:bg-gray-800/80 transition-all duration-300 ease-out cursor-pointer overflow-hidden';
    
    if (index === 0) return `${baseClass} border-yellow-400/40 hover:border-yellow-400/60 shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20`;
    if (index === 1) return `${baseClass} border-gray-300/40 hover:border-gray-300/60 shadow-lg shadow-gray-300/10 hover:shadow-gray-300/20`;
    if (index === 2) return `${baseClass} border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20`;
    return `${baseClass} border-gray-700/60 hover:border-gray-600/80 shadow-lg shadow-black/20`;
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
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Header with landscape layout */}
          <div className="max-w-7xl mx-auto ">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[60vh]">
              
              {/* Left Side - Hero Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full text-sm text-gray-300 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live Leaderboard
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                    LeetCode
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">
                      Leaderboard
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                    Track your competitive programming journey, compare progress with peers, and climb the ranks in real-time.
                  </p>
                </div>

                {/* Overall Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group p-6 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-gray-600/80 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-medium">Students</span>
                    </div>
                    <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {allStats.count}
                    </div>
                  </div>

                  <div className="group p-6 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-gray-600/80 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Target className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-medium">Problems</span>
                    </div>
                    <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                      {allStats.totalSolved}
                    </div>
                  </div>

                  <div className="group p-6 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-gray-600/80 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-medium">Weekly</span>
                    </div>
                    <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {allStats.weeklyProgress}
                    </div>
                  </div>

                  <div className="group p-6 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-gray-600/80 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-medium">Leader</span>
                    </div>
                    <div className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                      {allStats.weeklyTop?.displayName || '-'}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                  <Zap className="h-4 w-4" />
                  Updates within 5 minutes of submission
                </div>
              </div>

              {/* Right Side - Top 3 Podium */}
              <div className="flex justify-center items-end space-x-4 h-full">
                {paginatedUsers.slice(0, 3).map((user, index) => {
                  const position = index === 1 ? 0 : index === 0 ? 1 : 2; // Rearrange for podium effect
                  const heights = ['h-48', 'h-56', 'h-40']; // Second place tallest for visual effect
                  const orders = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
                  const actualIndex = orders[index];
                  const rankDisplay = getRankDisplay(actualIndex);
                  
                  return (
                    <div key={user.id} className={`relative ${heights[position]} w-32 flex flex-col justify-end`}>
                      {/* Podium */}
                      <div className={`relative ${rankDisplay.bg} border ${getUserCardClass(actualIndex).includes('border-yellow') ? 'border-yellow-400/40' : getUserCardClass(actualIndex).includes('border-gray-300') ? 'border-gray-300/40' : getUserCardClass(actualIndex).includes('border-amber') ? 'border-amber-500/40' : 'border-gray-600/40'} rounded-t-2xl p-4 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group`}
                        onClick={() => {setSelectedUser(user); setIsModalOpen(true);}}
                      >
                        {/* Position indicator */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className={`w-8 h-8 rounded-full ${rankDisplay.bg} border ${rankDisplay.class.includes('yellow') ? 'border-yellow-400' : rankDisplay.class.includes('gray') ? 'border-gray-300' : rankDisplay.class.includes('amber') ? 'border-amber-500' : 'border-gray-600'} flex items-center justify-center font-bold text-sm ${rankDisplay.class} shadow-lg`}>
                            {actualIndex + 1}
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center mb-3">
                          <Avatar className="h-12 w-12 border-2 border-gray-600 group-hover:border-gray-400 transition-colors">
                            <AvatarFallback className="bg-gray-800 text-white font-bold text-sm">
                              {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* User info */}
                        <div className="text-center space-y-1">
                          <div className="font-bold text-white text-sm truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                            {user.displayName}
                          </div>
                          <Badge variant="outline" className={`text-xs ${user.group === 'G1' ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'} bg-transparent`}>
                            {user.group}
                          </Badge>
                          
                          {/* Stats */}
                          <div className="space-y-1 pt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Weekly</span>
                              <span className="text-green-400 font-bold">{user.stats?.weeklyProgress || 0}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Total</span>
                              <span className="text-blue-400 font-bold">{user.stats?.totalSolved || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl pointer-events-none"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Group Stats Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {[
              { stats: g1Stats, name: 'G1', color: 'blue', gradient: 'from-blue-500/20 to-blue-600/10' },
              { stats: g2Stats, name: 'G2', color: 'purple', gradient: 'from-purple-500/20 to-purple-600/10' }
            ].map(({ stats, name, color, gradient }) => (
              <Card key={name} className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/80 transition-all duration-300 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} shadow-lg`}></div>
                      <span className="text-xl font-bold">Group {name}</span>
                      <Badge variant="outline" className={`${color === 'blue' ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'} bg-transparent`}>
                        {stats.count} members
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/80 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Total Solved</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.totalSolved}</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/80 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Weekly Progress</span>
                      </div>
                      <div className={`text-2xl font-bold ${color === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {stats.weeklyProgress}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors group/item">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">Weekly Champion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover/item:text-yellow-400 transition-colors">
                          {stats.weeklyTop?.displayName || '-'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover/item:text-yellow-400 transition-colors" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors group/item">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-gray-300">Overall Leader</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover/item:text-orange-400 transition-colors">
                          {stats.overallTop?.displayName || '-'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover/item:text-orange-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Update Notice */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              Updates reflect within 5 minutes of LeetCode submission
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {setFilter('all'); setCurrentPage(1);}}
              className={`${filter === 'all' 
                ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600 shadow-lg' 
                : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500'
              } px-6 py-2 rounded-full font-medium transition-all duration-200`}
            >
              <Filter className="h-4 w-4 mr-2" />
              All Students
            </Button>
            <Button 
              variant={filter === 'G1' ? 'default' : 'outline'}
              onClick={() => {setFilter('G1'); setCurrentPage(1);}}
              className={`${filter === 'G1' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500'
              } px-6 py-2 rounded-full font-medium transition-all duration-200`}
            >
              G1
            </Button>
            <Button 
              variant={filter === 'G2' ? 'default' : 'outline'}
              onClick={() => {setFilter('G2'); setCurrentPage(1);}}
              className={`${filter === 'G2' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-lg shadow-purple-600/20' 
                : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-purple-500'
              } px-6 py-2 rounded-full font-medium transition-all duration-200`}
            >
              G2
            </Button>
          </div>

          {/* Main Leaderboard */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gray-800/50 border-b border-gray-700/50">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-xl font-bold">Weekly Leaderboard</span>
                {filter !== 'all' && (
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${filter === 'G1' 
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10' 
                      : 'border-purple-500 text-purple-400 bg-purple-500/10'
                    }`}
                  >
                    {filter}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading || statsLoading ? (
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-6 border-b border-gray-800/50">
                      <Skeleton className="h-12 w-12 rounded-full bg-gray-700/50" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-700/50" />
                        <Skeleton className="h-3 w-24 bg-gray-700/50" />
                      </div>
                      <Skeleton className="h-8 w-16 bg-gray-700/50" />
                    </div>
                  ))}
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-800/30 rounded-full w-fit mx-auto mb-4">
                    <Users className="h-16 w-16 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium">No students found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filter</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {paginatedUsers.map((user, index) => {
                    const globalIndex = startIndex + index;
                    const rankDisplay = getRankDisplay(globalIndex);
                    
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-6 p-6 ${getUserCardClass(globalIndex)} hover:transform hover:scale-[1.01] relative overflow-hidden`}
                        onClick={() => {setSelectedUser(user); setIsModalOpen(true);}}
                      >
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none"></div>
                        
                        {/* Rank with enhanced styling */}
                        <div className={`relative flex items-center justify-center w-14 h-14 rounded-xl ${rankDisplay.bg} border backdrop-blur-sm group-hover:scale-110 transition-transform duration-200`}>
                          <span className={`text-lg font-bold ${rankDisplay.class}`}>
                            {rankDisplay.icon}
                          </span>
                          {globalIndex < 3 && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-xl animate-pulse"></div>
                          )}
                        </div>

                        {/* Enhanced Avatar */}
                        <Avatar className="h-14 w-14 border-2 border-gray-600 group-hover:border-gray-400 transition-all duration-200 group-hover:scale-105 shadow-lg">
                          <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-bold text-lg">
                            {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info with better typography */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-white truncate text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-200">
                              {user.displayName}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${user.group === 'G1' 
                                ? 'border-blue-500 text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20' 
                                : 'border-purple-500 text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20'
                              } transition-all duration-200`}
                            >
                              {user.group}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                            <span className="font-medium">Roll:</span> {user.rollNo} • 
                            <span className="font-medium ml-1">@{user.leetcodeUsername}</span>
                          </p>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="flex gap-8 text-right">
                          <div className="group/stat">
                            <div className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-1 group-hover/stat:scale-110 transition-transform duration-200">
                              {user.stats?.weeklyProgress || 0}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Weekly
                            </div>
                          </div>
                          <div className="group/stat">
                            <div className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors mb-1 group-hover/stat:scale-110 transition-transform duration-200">
                              {user.stats?.totalSolved || 0}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1">
                              <Code2 className="h-3 w-3" />
                              Total
                            </div>
                          </div>
                        </div>

                        {/* Hover indicator */}
                        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-800/30 border-t border-gray-700/50">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{startIndex + 1}</span> to{' '}
                    <span className="font-medium text-white">{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium text-white">{filteredUsers.length}</span> students
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Page <span className="font-bold text-white">{currentPage}</span> of{' '}
                        <span className="font-bold text-white">{totalPages}</span>
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced User Profile Modal */}
        <UserProfileModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {setIsModalOpen(false); setSelectedUser(null);}}
        />
      </div>
    </div>
  );
}