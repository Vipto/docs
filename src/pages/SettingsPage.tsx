import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Moon,
  Sun,
  Shield,
  History,
  Plus,
  Trash2,
  Check,
  Building,
  Key,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { WorkspaceMember, AuditLog, UserRole } from '@/types';
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
} from '@/services/workspaceService';
import { getAuditLogs } from '@/services/auditService';
import { seedInitialWorkspaceData } from '@/services/seedService';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { formatDate } from '@/utils/formatters';
import { canManageMembers, canViewAuditLogs } from '@/permissions/roles';

export const SettingsPage: React.FC = () => {
  const { user, switchUserRole } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'members' | 'appearance' | 'audit'>('profile');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Invite modal state
  const [isImportingNotion, setIsImportingNotion] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Editor');
  const [isInviting, setIsInviting] = useState(false);

  const handleImportNotion = async () => {
    setIsImportingNotion(true);
    try {
      await seedInitialWorkspaceData(user?.uid || 'u1', user?.name || 'Ayush Kumar', true);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      window.location.reload();
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setIsImportingNotion(false);
    }
  };

  useEffect(() => {
    getWorkspaceMembers().then(setMembers);
    getAuditLogs('vipto-workspace', 50).then(setAuditLogs);
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    setIsInviting(true);
    try {
      const newMember = await addWorkspaceMember('vipto-workspace', {
        userId: `user_${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setMembers((prev) => [...prev, newMember]);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('Editor');
    } catch (e) {
      console.error('Invite error:', e);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (!user) return;
    await updateMemberRole('vipto-workspace', targetUserId, newRole, user.uid, user.name);
    setMembers((prev) =>
      prev.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m))
    );
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!user) return;
    if (!window.confirm('Remove this member from workspace?')) return;
    await removeWorkspaceMember('vipto-workspace', targetUserId, user.uid, user.name);
    setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
  };

  const userRole = user?.role || 'Viewer';
  const roles: UserRole[] = ['Owner', 'Admin', 'Editor', 'Viewer'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Settings & Workspace</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account profile, workspace members, appearance, and audit trail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Role
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'members'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-4 h-4" /> Members & Roles
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'appearance'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Sun className="w-4 h-4" /> Appearance
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <History className="w-4 h-4" /> Audit Logs
        </button>
      </div>

      {/* Tab 1: Profile & Instant Role Testing */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-foreground">User Profile</h3>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'Ayush Kumar'} avatarUrl={user?.avatar} size="lg" />
              <div>
                <h4 className="font-bold text-sm text-foreground">{user?.name || 'Ayush Kumar'}</h4>
                <p className="text-xs text-muted-foreground">{user?.email || 'ayush@vipto.io'}</p>
                <div className="mt-2">
                  <Badge role={user?.role || 'Owner'}>{user?.role || 'Owner'}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Test Different User Roles</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Instantly switch active role to test access controls (Viewers read-only, Editors edit, Admins manage spaces/members, Owners full control).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchUserRole(r)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    user?.role === r
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{r}</span>
                    {user?.role === r && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {r === 'Owner' && 'Full workspace control'}
                    {r === 'Admin' && 'Manage spaces & roles'}
                    {r === 'Editor' && 'Create & edit pages'}
                    {r === 'Viewer' && 'Read-only access'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <span>Notion Knowledge Base Data</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  11 Spaces and 96 Documentation pages from <code>vipto-notion-export</code> are synced and ready for Confluence-style navigation and editing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleImportNotion}
                disabled={isImportingNotion}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isImportingNotion ? 'Syncing...' : importSuccess ? 'Synced!' : 'Re-sync Notion Data'}
              </button>
            </div>
            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
              Spaces included: <strong>Start Here</strong>, <strong>Learn Vipto</strong>, <strong>Seller Acquisition Strategy</strong>, <strong>Seller Discovery</strong>, <strong>Product Communication</strong>, <strong>Product CRM</strong>, <strong>Product Analytics & Experiments</strong>, <strong>Product Operations & Squads</strong>, <strong>Learning Modules</strong>, <strong>Intern & Global Research</strong>, <strong>Teams</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Members & Access Control */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {canManageMembers(userRole) && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Invite Team Member</h3>
              <form onSubmit={handleInviteMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email address"
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Invite
                </button>
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspace Roster ({members.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} avatarUrl={m.avatar} size="md" />
                    <div>
                      <div className="font-semibold text-xs text-foreground">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canManageMembers(userRole) ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge role={m.role}>{m.role}</Badge>
                    )}

                    {canManageMembers(userRole) && m.userId !== user?.uid && (
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">Theme Preference</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select your preferred interface appearance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500 mb-2" />
              <div className="font-bold text-xs text-foreground">Light Mode</div>
              <p className="text-[11px] text-muted-foreground mt-1">Clean crisp white aesthetics</p>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="font-bold text-xs text-foreground">Dark Mode</div>
              <p className="text-[11px] text-muted-foreground mt-1">Low-light comfortable reading</p>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <Building className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-bold text-xs text-foreground">System Default</div>
              <p className="text-[11px] text-muted-foreground mt-1">Sync with OS preferences</p>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspace Audit Trail
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Immutable event stream of workspace actions, creations, edits, and permission changes.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No audit logs recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 px-6 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      <span className="text-primary">{log.userName}</span>{' '}
                      <span className="text-muted-foreground lowercase">
                        {log.action.replace('_', ' ')}
                      </span>{' '}
                      "{log.entityTitle}"
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-muted-foreground">{log.details}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
