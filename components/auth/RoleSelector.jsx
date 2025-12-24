'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES, getRoleDisplayName } from '@/lib/permissions';

export default function RoleSelector({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ROLES).map((role) => (
            <SelectItem key={role} value={role}>
              {getRoleDisplayName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}