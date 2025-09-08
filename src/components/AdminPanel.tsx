import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { User, Trash2, UserPlus, Users, Pencil } from 'lucide-react';
import { User as UserType } from '@/types/user';
import { AdminEditUserDialog } from '@/components/AdminEditUserDialog';

export const AdminPanel = () => {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [group, setGroup] = useState<'G1' | 'G2'>('G1');
  const [loading, setLoading] = useState(false);
  
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const { users, addUser, deleteUser, loading: usersLoading } = useUsers();
  const { toast } = useToast();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim() || !displayName.trim() || !rollNo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addUser({
        rollNo: rollNo.trim(),
        leetcodeUsername: leetcodeUsername.trim(),
        displayName: displayName.trim(),
        group,
      });

      toast({
        title: "Student Added",
        description: `${displayName} has been added to ${group}!`,
      });

      // Reset form
      setRollNo('');
      setLeetcodeUsername('');
      setDisplayName('');
      setGroup('G1');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast({
        title: "Student Removed",
        description: `${userName} has been removed from the system.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Student Form */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  placeholder="Enter roll number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Student Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter student's full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
                <Input
                  id="leetcodeUsername"
                  placeholder="Enter LeetCode username"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select value={group} onValueChange={(value: 'G1' | 'G2') => setGroup(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G1">Group 1 (G1)</SelectItem>
                  <SelectItem value="G2">Group 2 (G2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <User className="h-4 w-4 animate-pulse" />
                  Adding Student...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Registered Students ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground mt-2">Loading students...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No students registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow-card transition-all duration-200 flex-wrap gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.displayName}</h3>
                        <Badge variant={user.group === 'G1' ? 'default' : 'secondary'}>
                          {user.group}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Roll No: {user.rollNo} • @{user.leetcodeUsername}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.displayName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminEditUserDialog
        user={editingUser}
        open={isEditOpen}
        onOpenChange={(o) => { setIsEditOpen(o); if (!o) setEditingUser(null); }}
      />
    </div>
  );
};
