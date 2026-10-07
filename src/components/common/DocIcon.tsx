import React from 'react';
import {
  FileText,
  Folder,
  BookOpen,
  Layers,
  Sparkles,
  Target,
  Compass,
  Code,
  Database,
  Briefcase,
  Globe,
  Cpu,
  Workflow,
  Rocket,
  Search,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Settings,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Terminal,
  Shield,
  Lightbulb,
  Zap,
  Bookmark,
} from 'lucide-react';

interface DocIconProps {
  icon?: string | null;
  className?: string;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  file: FileText,
  document: FileText,
  book: BookOpen,
  folder: Folder,
  layers: Layers,
  sparkles: Sparkles,
  target: Target,
  compass: Compass,
  code: Code,
  database: Database,
  briefcase: Briefcase,
  globe: Globe,
  cpu: Cpu,
  workflow: Workflow,
  rocket: Rocket,
  search: Search,
  chat: MessageSquare,
  chart: BarChart3,
  trending: TrendingUp,
  settings: Settings,
  users: Users,
  checklist: CheckSquare,
  spreadsheet: FileSpreadsheet,
  terminal: Terminal,
  shield: Shield,
  lightbulb: Lightbulb,
  zap: Zap,
  bookmark: Bookmark,
};

export const AVAILABLE_DOC_ICONS = [
  { name: 'file', label: 'Document', icon: FileText },
  { name: 'book', label: 'Book', icon: BookOpen },
  { name: 'layers', label: 'Layers', icon: Layers },
  { name: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { name: 'target', label: 'Target', icon: Target },
  { name: 'compass', label: 'Compass', icon: Compass },
  { name: 'code', label: 'Code', icon: Code },
  { name: 'database', label: 'Database', icon: Database },
  { name: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { name: 'globe', label: 'Globe', icon: Globe },
  { name: 'workflow', label: 'Workflow', icon: Workflow },
  { name: 'rocket', label: 'Launch', icon: Rocket },
  { name: 'chart', label: 'Analytics', icon: BarChart3 },
  { name: 'checklist', label: 'Tasks', icon: CheckSquare },
  { name: 'shield', label: 'Security', icon: Shield },
  { name: 'lightbulb', label: 'Idea', icon: Lightbulb },
  { name: 'bookmark', label: 'Bookmark', icon: Bookmark },
];

export const DocIcon: React.FC<DocIconProps> = ({ icon, className = 'w-4 h-4' }) => {
  if (!icon) {
    return <FileText className={className} />;
  }

  const key = icon.toLowerCase().trim();
  const IconComponent = ICON_MAP[key];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Fallback for default clean look without any emoji
  return <FileText className={className} />;
};
