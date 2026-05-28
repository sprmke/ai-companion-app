'use client';

import React, { Fragment, useContext, useEffect, useState } from 'react';

import Image from 'next/image';

import { Plus, Search } from 'lucide-react';

import { BlurFade } from '@/components/magicui/blur-fade';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAccountSummary } from '@/components/common/user-account-summary';

import AddNewAssistant from '@/app/(main)/workspace/_components/AddNewAssistant';

import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';

import type { AiAssistants } from '@/app/(main)/types';

import UserProfile from '@/app/(main)/workspace/_components/UserProfile';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function AssistantList({
  mobile = false,
  collapsed = false,
  onCompanionSelect,
}: {
  mobile?: boolean;
  collapsed?: boolean;
  onCompanionSelect?: () => void;
}) {
  const convex = useConvex();
  const router = useRouter();

  const { user } = useContext(AuthContext);
  const { assistant, setAssistant, assistantsRefreshKey } =
    useContext(AssistantContext);

  const [assistants, setAssistants] = useState<AiAssistants>([]);
  const [openUserProfile, setOpenUserProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?._id || assistants.length > 0) return;

    getUserAssistants();
  }, [user?._id, assistants.length]);

  useEffect(() => {
    if (!user?._id || assistantsRefreshKey === 0) return;

    getUserAssistants();
  }, [assistantsRefreshKey, user?._id]);

  const getUserAssistants = async ({ reselect = false } = {}) => {
    if (!user?._id) return;

    try {
      const loadedAssistants = await convex.query(
        api.userAiAssistants.getAllUserAssistants,
        {
          userId: user._id,
        }
      );

      if (!loadedAssistants.length) {
        router.push('/assistants');
        return;
      }

      setAssistants(loadedAssistants);

      if (reselect || !assistant) {
        setAssistant(loadedAssistants[0]);
        return;
      }

      const stillSelected = loadedAssistants.find(
        (item) => item._id === assistant._id
      );
      setAssistant(stillSelected ?? loadedAssistants[0]);
    } catch (error) {
      console.error('Failed to load companions:', error);
    }
  };

  const filteredAssistants = assistants.filter(
    (assistant) =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col',
        mobile ? 'gap-4 overflow-hidden bg-muted/30 p-5' : 'gap-3',
        collapsed && !mobile && 'items-center'
      )}
    >
      <AddNewAssistant onAddAssistant={getUserAssistants}>
        <Button
          className={cn(
            'rounded-2xl shadow-soft',
            collapsed && !mobile
              ? 'h-11 w-11 shrink-0 p-0'
              : 'h-11 w-full'
          )}
          title="Add New Companion"
        >
          {collapsed && !mobile ? (
            <Plus className="h-5 w-5" />
          ) : (
            '+ Add New Companion'
          )}
        </Button>
      </AddNewAssistant>

      {!collapsed || mobile ? (
        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search companions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      ) : null}

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto scrollbar-hide',
          collapsed && !mobile ? 'w-full space-y-1.5' : 'space-y-2 pr-0.5'
        )}
      >
        {filteredAssistants.map((_assistant, index) => (
            <BlurFade key={index} delay={0.25 + index * 0.05} inView>
              <div
                role="button"
                tabIndex={0}
                title={
                  collapsed && !mobile
                    ? `${_assistant.name} — ${_assistant.title}`
                    : undefined
                }
                className={cn(
                  'flex cursor-pointer items-center rounded-2xl border border-transparent transition-all duration-200 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  collapsed && !mobile
                    ? 'mx-auto min-h-0 w-11 justify-center p-0.5'
                    : 'min-h-[68px] gap-3.5 px-3 py-3',
                  _assistant.id === assistant?.id &&
                    (collapsed && !mobile
                      ? 'nav-item-active rounded-xl p-1'
                      : 'nav-item-active')
                )}
                onClick={() => {
                  setAssistant(_assistant);
                  onCompanionSelect?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setAssistant(_assistant);
                    onCompanionSelect?.();
                  }
                }}
              >
                <Image
                  src={_assistant.image}
                  alt={_assistant.name}
                  width={48}
                  height={48}
                  className={cn(
                    'shrink-0 rounded-xl object-cover ring-2',
                    collapsed && !mobile ? 'h-10 w-10' : 'h-12 w-12',
                    _assistant.id === assistant?.id
                      ? 'ring-primary/35'
                      : 'ring-border/40'
                  )}
                />
                {(!collapsed || mobile) && (
                  <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
                    <h2
                      className={cn(
                        'truncate text-[15px] font-bold leading-tight',
                        _assistant.id === assistant?.id && 'text-primary'
                      )}
                    >
                      {_assistant.name}
                    </h2>
                    <p
                      className={cn(
                        'truncate text-sm leading-snug',
                        _assistant.id === assistant?.id
                          ? 'text-primary/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {_assistant.title}
                    </p>
                  </div>
                )}
              </div>
            </BlurFade>
          ))}
      </div>

      <UserAccountSummary
        collapsed={collapsed && !mobile}
        user={user}
        onClick={() => setOpenUserProfile(true)}
      />
      <UserProfile
        openUserProfile={openUserProfile}
        setOpenUserProfile={setOpenUserProfile}
      />
    </div>
  );
}

export default AssistantList;
