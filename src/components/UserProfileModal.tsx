import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Award, Target, TrendingUp, Calendar } from 'lucide-react';
import { fetchLeetCodeStats, LeetCodeStats } from '@/lib/leetcode-api';
import { UserWithStats } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileModalProps {
  user: UserWithStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setLoading(true);
      setError(null);
      
      fetchLeetCodeStats(user.leetcodeUsername)
        .then(setStats)
        .catch((err) => setError('Failed to load LeetCode stats'))
        .finally(() => setLoading(false));
    }
  }, [user, isOpen]);

  if (!user) return null;

  const getDifficultyColor = (type: 'easy' | 'medium' | 'hard') => {
    switch (type) {
      case 'easy': return 'bg-leetcode-green';
      case 'medium': return 'bg-leetcode-orange';
      case 'hard': return 'bg-leetcode-red';
      default: return 'bg-primary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {user.displayName}
                <Badge variant={user.group === 'G1' ? 'default' : 'secondary'}>
                  {user.group}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                @{user.leetcodeUsername}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {stats && !loading && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Total Solved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalSolved}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {stats.totalQuestions}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-leetcode-orange" />
                    Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-leetcode-orange">
                    {stats.ranking?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Global</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-leetcode-green" />
                    Acceptance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-leetcode-green">
                    {stats.acceptanceRate?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {user.stats?.weeklyProgress || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Problems</p>
                </CardContent>
              </Card>
            </div>

            {/* Problem Breakdown */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Problem Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Easy */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-leetcode-green">Easy</span>
                      <span className="text-sm font-bold">
                        {stats.easySolved} / {stats.totalEasy}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.easySolved / stats.totalEasy) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Medium */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-leetcode-orange">Medium</span>
                      <span className="text-sm font-bold">
                        {stats.mediumSolved} / {stats.totalMedium}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.mediumSolved / stats.totalMedium) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Hard */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-leetcode-red">Hard</span>
                      <span className="text-sm font-bold">
                        {stats.hardSolved} / {stats.totalHard}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.hardSolved / stats.totalHard) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Contribution Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {stats.contributionPoints || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Reputation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-leetcode-orange">
                    {stats.reputation || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};