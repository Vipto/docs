import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal';
import { TemplatePickerModal } from '@/components/templates/TemplatePickerModal';
import { ShortcutsModal } from '@/components/common/ShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getSpaces } from '@/services/spaceService';
import { createPage } from '@/services/pageService';
import { useAuth } from '@/hooks/useAuth';
import { Space, PageTemplate } from '@/types';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('vipto_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const fetchSpacesList = async () => {
    try {
      const list = await getSpaces('vipto-workspace');
      setSpaces(list);
    } catch (e) {
      console.warn('Could not fetch spaces:', e);
    }
  };

  useEffect(() => {
    fetchSpacesList();
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('vipto_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleCreateDefaultPage = async () => {
    if (spaces.length === 0) {
      setCreateSpaceOpen(true);
      return;
    }
    const targetSpace = spaces[0];
    try {
      const newPage = await createPage({
        workspaceId: 'vipto-workspace',
        spaceId: targetSpace.id,
        title: 'Untitled Document',
        authorId: user?.uid || 'u1',
        authorName: user?.name || 'Ayush Kumar',
      });
      fetchSpacesList();
      navigate(`/spaces/${targetSpace.key}/${newPage.id}`);
    } catch (e) {
      console.error('Failed to create page:', e);
    }
  };

  const handleSelectTemplate = async (template: PageTemplate, spaceId: string) => {
    const targetSpace = spaces.find((s) => s.id === spaceId) || spaces[0];
    try {
      const newPage = await createPage({
        workspaceId: 'vipto-workspace',
        spaceId: targetSpace.id,
        title: template.title,
        icon: template.icon,
        content: template.content,
        authorId: user?.uid || 'u1',
        authorName: user?.name || 'Ayush Kumar',
      });
      fetchSpacesList();
      navigate(`/spaces/${targetSpace.key}/${newPage.id}`);
    } catch (e) {
      console.error('Failed to create page from template:', e);
    }
  };

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onOpenSearch: () => setSearchOpen(true),
    onOpenShortcuts: () => setShortcutsOpen(true),
    onNewPage: handleCreateDefaultPage,
  });

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Navigation */}
      <TopNav
        onOpenSearch={() => setSearchOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onNewPageClick={handleCreateDefaultPage}
        onNewSpaceClick={() => setCreateSpaceOpen(true)}
        onTemplateClick={() => setTemplatePickerOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Body Shell */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <Sidebar
          spaces={spaces}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onNewSpaceClick={() => setCreateSpaceOpen(true)}
          onTemplateClick={() => setTemplatePickerOpen(true)}
        />

        {/* Mobile Drawer Backdrop & Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div
              className="fixed inset-0"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-card h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left">
              <Sidebar
                spaces={spaces}
                isCollapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
                onNewSpaceClick={() => {
                  setMobileSidebarOpen(false);
                  setCreateSpaceOpen(true);
                }}
                onTemplateClick={() => {
                  setMobileSidebarOpen(false);
                  setTemplatePickerOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          <Outlet context={{ spaces, refreshSpaces: fetchSpacesList }} />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNewPageClick={handleCreateDefaultPage}
        onNewSpaceClick={() => setCreateSpaceOpen(true)}
        onTemplateClick={() => setTemplatePickerOpen(true)}
      />

      <CreateSpaceModal
        isOpen={createSpaceOpen}
        onClose={() => setCreateSpaceOpen(false)}
        onSpaceCreated={(newSpace) => {
          fetchSpacesList();
          navigate(`/spaces/${newSpace.key}`);
        }}
      />

      <TemplatePickerModal
        isOpen={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        spaces={spaces}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
};
