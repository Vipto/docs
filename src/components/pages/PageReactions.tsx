import React, { useState } from 'react';
import {
  ThumbsUp,
  Heart,
  Sparkles,
  Flame,
  Rocket,
  PartyPopper,
  Lightbulb,
  Smile,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PageReactionsProps {
  pageId: string;
  reactions: Record<string, string[]>; // reactionType -> array of userIds
  currentUserId: string;
  currentUserName: string;
  onToggleReaction: (reactionKey: string) => void;
}

const REACTION_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  thumbs_up: { label: 'Like', icon: ThumbsUp },
  heart: { label: 'Love', icon: Heart },
  sparkles: { label: 'Great Work', icon: Sparkles },
  rocket: { label: 'Launch', icon: Rocket },
  fire: { label: 'Hot', icon: Flame },
  celebrate: { label: 'Celebrate', icon: PartyPopper },
  lightbulb: { label: 'Insight', icon: Lightbulb },
};

const AVAILABLE_REACTIONS = ['thumbs_up', 'heart', 'sparkles', 'rocket', 'fire', 'celebrate', 'lightbulb'];

export const PageReactions: React.FC<PageReactionsProps> = ({
  reactions = {},
  currentUserId,
  currentUserName,
  onToggleReaction,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelectReaction = (key: string) => {
    onToggleReaction(key);
    setPickerOpen(false);

    // Fire subtle confetti on celebratory reactions
    if (['celebrate', 'rocket', 'fire', 'sparkles'].includes(key)) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  const activeReactions = Object.entries(reactions).filter(([_, userIds]) => userIds && userIds.length > 0);

  return (
    <div className="flex items-center flex-wrap gap-1.5 pt-4">
      {/* Existing Reaction Chips */}
      {activeReactions.map(([reactionKey, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        const config = REACTION_CONFIG[reactionKey] || { label: reactionKey, icon: Sparkles };
        const IconComponent = config.icon;

        return (
          <button
            key={reactionKey}
            type="button"
            onClick={() => handleSelectReaction(reactionKey)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              hasReacted
                ? 'bg-primary/15 border-primary/40 text-primary font-bold shadow-2xs scale-105'
                : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={`${config.label} (${userIds.length})`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${hasReacted ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-[11px] font-mono font-semibold">{userIds.length}</span>
          </button>
        );
      })}

      {/* Add Reaction Button & Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Add page reaction"
        >
          <Smile className="w-3.5 h-3.5 text-primary" />
          <span>React</span>
        </button>

        {pickerOpen && (
          <div className="absolute left-0 bottom-full mb-2 p-1.5 rounded-2xl border border-border bg-popover shadow-2xl z-50 flex items-center gap-1 animate-in fade-in zoom-in-95">
            {AVAILABLE_REACTIONS.map((key) => {
              const item = REACTION_CONFIG[key];
              const IconCmp = item.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectReaction(key)}
                  className="p-2 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-transform hover:scale-125"
                  title={item.label}
                >
                  <IconCmp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
