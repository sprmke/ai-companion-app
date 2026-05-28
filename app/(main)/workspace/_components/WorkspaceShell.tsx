'use client';

import { useContext, useState } from 'react';
import { Bot, MessageSquare, Settings2 } from 'lucide-react';

import ChatUI from '@/app/(main)/workspace/_components/ChatUI';
import AssistantList from '@/app/(main)/workspace/_components/AssistantList';
import AssistantSettings from '@/app/(main)/workspace/_components/AssistantSettings';
import { WorkspaceSidebar } from '@/app/(main)/workspace/_components/WorkspaceSidebar';
import { useSidebarCollapsed } from '@/app/(main)/workspace/_components/use-sidebar-collapsed';
import { WorkspaceLoadingView } from '@/components/common/workspace-loading-view';
import { AssistantContext } from '@/context/AssistantContext';
import { useWorkspaceBootstrap } from '@/hooks/use-workspace-bootstrap';
import { cn } from '@/lib/utils';

type MobilePanel = 'chat' | 'companions' | 'settings';

const mobileTabs: { id: MobilePanel; label: string; icon: typeof Bot }[] = [
  { id: 'companions', label: 'Companions', icon: Bot },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export default function WorkspaceShell() {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('chat');
  const { collapsed: leftCollapsed, toggle: toggleLeft } =
    useSidebarCollapsed('left');
  const { collapsed: rightCollapsed, toggle: toggleRight, expand: expandRight } =
    useSidebarCollapsed('right');
  const { assistant, isWorkspaceLoading } = useContext(AssistantContext);

  useWorkspaceBootstrap();

  const isWorkspaceReady = Boolean(assistant) && !isWorkspaceLoading;

  if (!isWorkspaceReady) {
    return <WorkspaceLoadingView />;
  }

  return (
    <div className="relative top-[60px] h-[calc(100vh-60px)] w-full overflow-hidden bg-background">
      <div className="workspace-shell hidden lg:grid">
        <WorkspaceSidebar
          collapsed={leftCollapsed}
          onToggle={toggleLeft}
          side="left"
        >
          <AssistantList collapsed={leftCollapsed} />
        </WorkspaceSidebar>

        <div className="panel-surface chat-panel-surface min-h-0 min-w-0 overflow-hidden">
          <ChatUI />
        </div>

        <WorkspaceSidebar
          collapsed={rightCollapsed}
          onToggle={toggleRight}
          side="right"
        >
          <AssistantSettings
            collapsed={rightCollapsed}
            onExpandSidebar={expandRight}
          />
        </WorkspaceSidebar>
      </div>

      <div className="flex h-full flex-col lg:hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobilePanel === 'companions' && (
            <AssistantList
              mobile
              onCompanionSelect={() => setMobilePanel('chat')}
            />
          )}
          {mobilePanel === 'chat' && (
            <div className="h-full bg-card/50 backdrop-blur-sm dark:bg-background/90">
              <ChatUI mobile />
            </div>
          )}
          {mobilePanel === 'settings' && <AssistantSettings mobile />}
        </div>

        <nav className="flex shrink-0 border-t border-border/50 bg-background/90 px-2 py-2 backdrop-blur-xl">
          {mobileTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobilePanel(id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-all',
                mobilePanel === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
