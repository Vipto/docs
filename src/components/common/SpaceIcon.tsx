import React from 'react';
import {
  Folder,
  Layers,
  BookOpen,
  Rocket,
  Lightbulb,
  Target,
  Search,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Settings,
  Users,
  Database,
  Globe,
  Code,
  Shield,
  Briefcase,
  Compass,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SpaceIconProps {
  icon?: string | null;
  className?: string;
}

const SPACE_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  folder: Folder,
  layers: Layers,
  book: BookOpen,
  rocket: Rocket,
  lightbulb: Lightbulb,
  target: Target,
  search: Search,
  chat: MessageSquare,
  message: MessageSquare,
  chart: BarChart3,
  analytics: TrendingUp,
  settings: Settings,
  ops: Settings,
  users: Users,
  team: Users,
  teams: Users,
  database: Database,
  globe: Globe,
  code: Code,
  shield: Shield,
  briefcase: Briefcase,
  compass: Compass,
  sparkles: Sparkles,
  zap: Zap,
};

export const AVAILABLE_SPACE_ICONS = [
  { name: 'folder', label: 'Folder', icon: Folder },
  { name: 'layers', label: 'Layers', icon: Layers },
  { name: 'book', label: 'Knowledge', icon: BookOpen },
  { name: 'rocket', label: 'Launch', icon: Rocket },
  { name: 'lightbulb', label: 'Product', icon: Lightbulb },
  { name: 'target', label: 'Goals', icon: Target },
  { name: 'search', label: 'Research', icon: Search },
  { name: 'chat', label: 'Communications', icon: MessageSquare },
  { name: 'chart', label: 'Analytics', icon: BarChart3 },
  { name: 'settings', label: 'Operations', icon: Settings },
  { name: 'users', label: 'Squads & Teams', icon: Users },
  { name: 'database', label: 'Data', icon: Database },
  { name: 'globe', label: 'Global', icon: Globe },
  { name: 'code', label: 'Engineering', icon: Code },
  { name: 'briefcase', label: 'Business', icon: Briefcase },
];

export const SpaceIcon: React.FC<SpaceIconProps> = ({ icon, className = 'w-4 h-4' }) => {
  if (!icon) {
    return <Folder className={className} />;
  }

  const key = icon.toLowerCase().trim();
  const IconComponent = SPACE_ICON_MAP[key];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  return <Folder className={className} />;
};
