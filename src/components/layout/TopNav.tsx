import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Settings,
  LogOut,
  Keyboard,
  User,
  Shield,
  Sparkles,
  FolderPlus,
  FilePlus,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { UserRole } from '@/types';
import { canCreatePage, canCreateSpace } from '@/permissions/roles';

interface TopNavProps {
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
  onNewPageClick: () => void;
  onNewSpaceClick: () => void;
  onTemplateClick: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSearch,
  onOpenShortcuts,
  onNewPageClick,
  onNewSpaceClick,
  onTemplateClick,
  onToggleMobileSidebar,
}) => {
  const { user, signOut, switchUserRole, quickLoginAs } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: UserRole[] = ['Owner', 'Admin', 'Editor', 'Viewer'];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-card/85 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle + Vipto Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-foreground flex items-center gap-1">
              Vipto <span className="text-primary font-semibold">Docs</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search documentation, spaces, pages...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Create Button + Notifications + Theme + User Profile */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted sm:hidden"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Create Dropdown */}
        <div className="relative" ref={createMenuRef}>
          <button
            type="button"
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {createMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              {canCreatePage(user?.role || 'Viewer') && (
                <button
                  onClick={() => {
                    setCreateMenuOpen(false);
                    onNewPageClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-foreground text-left transition-colors"
                >
                  <FilePlus className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-semibold">New Page</div>
                    <div className="text-[11px] text-muted-foreground">Add documentation page</div>
                  </div>
                </button>
              )}

              {canCreateSpace(user?.role || 'Viewer') && (
                <button
                  onClick={() => {
                    setCreateMenuOpen(false);
                    onNewSpaceClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-foreground text-left transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-semibold">New Space</div>
                    <div className="text-[11px] text-muted-foreground">Create team workspace</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onTemplateClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-foreground text-left transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-semibold">From Template</div>
                  <div className="text-[11px] text-muted-foreground">PRD, Meeting Notes, RFC</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
          >
            <Avatar name={user?.name || 'Ayush'} avatarUrl={user?.avatar} size="sm" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
              {/* User Details Header */}
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <div className="font-bold text-sm text-foreground truncate">{user?.name || 'Ayush Kumar'}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email || 'ayush@vipto.io'}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge role={user?.role || 'Owner'} size="sm">
                    {user?.role || 'Owner'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">Workspace Admin</span>
                </div>
              </div>

              {/* Quick Role Switcher for instant testing */}
              <div className="px-3 py-2 border-b border-border bg-muted/30 rounded-xl my-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" /> Role Switcher:
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchUserRole(r);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        user?.role === r
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-foreground text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Settings & Workspace
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-foreground text-left"
                >
                  <Keyboard className="w-3.5 h-3.5 text-muted-foreground" /> Keyboard Shortcuts
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    signOut();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive text-left font-medium border-t border-border mt-1 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
