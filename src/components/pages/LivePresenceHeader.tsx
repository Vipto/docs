import React from 'react';
import { PresenceUser } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Radio } from 'lucide-react';

interface LivePresenceHeaderProps {
  collaborators: PresenceUser[];
  currentUserId?: string;
}

export const LivePresenceHeader: React.FC<LivePresenceHeaderProps> = ({
  collaborators,
  currentUserId,
}) => {
  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-muted/30 border border-border/80 px-2.5 py-1 rounded-full text-xs">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Live</span>
      </div>

      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {collaborators.map((user) => {
          const isCurrentUser = user.userId === currentUserId;
          return (
            <div
              key={user.userId}
              className="relative group ring-2 ring-background rounded-full cursor-pointer transition-transform hover:scale-115 hover:z-20"
              title={`${user.name} (${user.status === 'editing' ? 'Editing' : 'Viewing'})`}
            >
              <Avatar
                name={user.name}
                avatarUrl={user.avatar}
                size="sm"
                className="w-6 h-6 text-[10px]"
              />
              <span
                style={{ backgroundColor: user.color }}
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-background"
              />
            </div>
          );
        })}
      </div>

      <span className="text-[10px] text-muted-foreground font-mono hidden md:inline">
        {collaborators.length} online
      </span>
    </div>
  );
};
