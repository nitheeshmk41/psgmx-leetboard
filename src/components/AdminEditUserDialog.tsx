import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/types/user';
import { useUsers } from '@/hooks/useFirestore';
import { Pencil } from 'lucide-react';

interface AdminEditUserDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminEditUserDialog = ({ user, open, onOpenChange }: AdminEditUserDialogProps) => {
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [leetcodeUsername, setLeetcodeUsername] = useState(user?.leetcodeUsername ?? '');
  const [group, setGroup] = useState<'G1' | 'G2'>(user?.group ?? 'G1');
  const { updateUser } = useUsers();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Sync internal state when user changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resetState = () => {
    setDisplayName(user?.displayName ?? '');
    setLeetcodeUsername(user?.leetcodeUsername ?? '');
    setGroup(user?.group ?? 'G1');
  };

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !leetcodeUsername.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and LeetCode username cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.id, { 
        displayName: displayName.trim(),
        leetcodeUsername: leetcodeUsername.trim(),
        group 
      });
      toast({ title: 'Updated', description: 'Student information updated successfully.' });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update student.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Edit Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Student Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter full name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
            <Input
              id="leetcodeUsername"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="Enter LeetCode username"
            />
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
