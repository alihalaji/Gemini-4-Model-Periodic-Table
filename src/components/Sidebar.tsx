import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarCheck2,
  Clock,
  Download,
  Images,
  LayoutGrid,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Smartphone,
  X,
} from 'lucide-react';
import { ComposeChatIcon, GeminiBrandSparkle, TemporaryChatIcon } from './Icons';

export type NavSection = 'new' | 'search' | 'gems' | 'library' | 'history' | 'tasks' | 'settings';

export interface SavedSession {
  id: string;
  title: string;
  modelLabel: string;
  timestamp: string;
}

interface SidebarProps {
  activeNav: NavSection;
  onSelectNav: (section: NavSection) => void;
  isTemporaryChat: boolean;
  onToggleTemporaryChat: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: (open: boolean) => void;
  sessions: SavedSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  isHistoryDrawerOpen: boolean;
  onCloseHistoryDrawer: () => void;
}

const RAIL_ITEMS: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'new', label: 'New chat', icon: ComposeChatIcon },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'gems', label: 'Gems', icon: LayoutGrid },
  { id: 'library', label: 'My stuff', icon: Images },
  { id: 'history', label: 'Recent', icon: Clock },
  { id: 'tasks', label: 'Scheduled actions', icon: CalendarCheck2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  isTemporaryChat,
  onToggleTemporaryChat,
  isMobileMenuOpen,
  onToggleMobileMenu,
  sessions,
  activeSessionId,
  onSelectSession,
  isHistoryDrawerOpen,
  onCloseHistoryDrawer,
}) => {
  const [isGetAppOpen, setIsGetAppOpen] = useState(false);
  const getAppRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isGetAppOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (getAppRef.current && !getAppRef.current.contains(e.target as Node)) {
        setIsGetAppOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsGetAppOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isGetAppOpen]);

  return (
    <>
      {/* Desktop Left Icon Rail (Exact Google Gemini proportion & Material 3 surfaces) */}
      <aside
        aria-label="Primary navigation"
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-[64px] flex-col items-center justify-between py-3.5 select-none"
      >
        <div className="flex flex-col items-center gap-5">
          {/* Top-left 4-color Gemini Sparkle */}
          <button
            type="button"
            onClick={() => onSelectNav('new')}
            aria-label="Gemini Home"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#e3e3e3]/[0.08] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
          >
            <GeminiBrandSparkle className="w-[22px] h-[22px]" />
          </button>

          {/* Vertical Rail Icons with crisp Material 3 plain tooltips */}
          <nav className="flex flex-col items-center gap-1.5">
            {RAIL_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = activeNav === id || (id === 'history' && isHistoryDrawerOpen);
              return (
                <div key={id} className="group relative flex items-center">
                  <button
                    type="button"
                    onClick={() => onSelectNav(id)}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                      isActive
                        ? 'bg-[#282a2c] text-[#e3e3e3]'
                        : 'text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </button>

                  {/* Authentic Google Material 3 plain tooltip */}
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100 absolute left-[46px] z-50 rounded-[6px] bg-[#303134] px-2.5 py-1 text-[11px] font-medium text-[#e8eaed] whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Settings + Clean Google Account Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="group relative flex items-center">
            <button
              type="button"
              onClick={() => onSelectNav('settings')}
              aria-label="Settings"
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                activeNav === 'settings'
                  ? 'bg-[#282a2c] text-[#e3e3e3]'
                  : 'text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <div
              role="tooltip"
              className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 absolute left-[46px] z-50 rounded-[6px] bg-[#303134] px-2.5 py-1 text-[11px] font-medium text-[#e8eaed] whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
            >
              Settings
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectNav('settings')}
            aria-label="Google Account"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#333537] hover:ring-4 hover:ring-[#e3e3e3]/[0.08] text-[13px] font-medium text-[#e3e3e3] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
          >
            A
          </button>
        </div>
      </aside>

      {/* Desktop Recent Chats Drawer */}
      <AnimatePresence>
        {isHistoryDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="hidden md:block fixed inset-0 left-[64px] z-30 bg-black/30"
              onClick={onCloseHistoryDrawer}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              aria-label="Recent chats"
              className="hidden md:flex fixed left-[64px] top-0 bottom-0 z-40 w-[276px] flex-col bg-[#1e1f20] border-r border-white/[0.06] p-4 shadow-[8px_0_32px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[14px] font-medium text-[#e3e3e3]">Recent</h2>
                <button
                  type="button"
                  onClick={onCloseHistoryDrawer}
                  aria-label="Close recent chats"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 text-[#8e918f]">
                  <MessageSquare className="w-5 h-5 mb-2 opacity-60" />
                  <p className="text-[13px] text-[#c4c7c5]">No recent chats</p>
                  <p className="text-[12px] mt-1">
                    Chats you start will show up here.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 custom-scrollbar">
                  {sessions.map((session) => {
                    const isCurrent = session.id === activeSessionId;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => {
                          onSelectSession(session.id);
                          onCloseHistoryDrawer();
                        }}
                        className={`flex flex-col items-start gap-0.5 w-full rounded-full px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#004a77] text-[#c2e7ff]'
                            : 'text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
                        }`}
                      >
                        <span className="text-[13px] font-medium truncate w-full">
                          {session.title}
                        </span>
                        <span
                          className={`text-[11px] ${
                            isCurrent ? 'text-[#c2e7ff]/75' : 'text-[#8e918f]'
                          }`}
                        >
                          {session.modelLabel} · {session.timestamp}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Seamless Top Bar (No border line on mobile — flows directly into the dark canvas) */}
      <header className="fixed top-0 left-0 right-0 md:left-[64px] z-30 flex items-center justify-between md:justify-end h-14 px-2 sm:px-4 md:px-5 bg-transparent pointer-events-auto md:pointer-events-none">
        {/* Mobile Left: Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => onToggleMobileMenu(true)}
            aria-label="Open navigation menu"
            className="flex items-center justify-center w-11 h-11 rounded-full text-[#e3e3e3] active:bg-[#e3e3e3]/[0.1] hover:bg-[#e3e3e3]/[0.08] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
          >
            <Menu className="w-[21px] h-[21px]" />
          </button>
        </div>

        {/* Mobile Center: Clean Gemini Brand Lockup */}
        <button
          type="button"
          onClick={() => onSelectNav('new')}
          aria-label="Gemini Home"
          className="flex md:hidden items-center gap-2 h-11 px-3 rounded-full active:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
        >
          <GeminiBrandSparkle className="w-[20px] h-[20px]" />
          <span className="text-[18px] font-normal text-[#e3e3e3] tracking-[-0.015em]">
            Gemini
          </span>
        </button>

        {/* Mobile Right: Temporary Chat + Clean Account Avatar */}
        <div className="flex md:hidden items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleTemporaryChat}
            aria-label="Temporary chat"
            aria-pressed={isTemporaryChat}
            className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
              isTemporaryChat
                ? 'bg-[#004a77] text-[#c2e7ff]'
                : 'text-[#c4c7c5] active:bg-[#e3e3e3]/[0.1]'
            }`}
          >
            <TemporaryChatIcon className="w-[19px] h-[19px]" />
          </button>

          <button
            type="button"
            onClick={() => onSelectNav('settings')}
            aria-label="Google Account"
            className="flex items-center justify-center w-11 h-11 rounded-full active:bg-[#e3e3e3]/[0.08] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#333537] text-[13px] font-medium text-[#e3e3e3]">
              A
            </span>
          </button>
        </div>

        {/* Desktop Top-Right Controls: Get app + Temporary Chat */}
        <div className="hidden md:flex items-center gap-2 pointer-events-auto">
          <div ref={getAppRef} className="relative">
            <button
              type="button"
              onClick={() => setIsGetAppOpen((prev) => !prev)}
              aria-expanded={isGetAppOpen}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] text-[13px] font-medium text-[#e3e3e3] whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
            >
              <Download className="w-3.5 h-3.5 text-[#c4c7c5]" />
              <span>Get app</span>
            </button>

            <AnimatePresence>
              {isGetAppOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
                  role="dialog"
                  aria-label="Get the Gemini app"
                  className="absolute right-0 top-[calc(100%+8px)] w-[264px] rounded-[16px] bg-[#282a2c] p-4 shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1e1f20] shrink-0">
                      <Smartphone className="w-4 h-4 text-[#a8c7fa]" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#e3e3e3]">
                        Gemini mobile app
                      </div>
                      <p className="text-[12px] text-[#c4c7c5] mt-0.5 leading-relaxed">
                        Use Gemini on Android and iOS.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGetAppOpen(false)}
                      className="h-9 rounded-full bg-[#333537] hover:bg-[#3f4144] text-[12px] font-medium text-[#e3e3e3] transition-colors cursor-pointer"
                    >
                      Google Play
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGetAppOpen(false)}
                      className="h-9 rounded-full bg-[#333537] hover:bg-[#3f4144] text-[12px] font-medium text-[#e3e3e3] transition-colors cursor-pointer"
                    >
                      App Store
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onToggleTemporaryChat}
            aria-label="Temporary chat"
            aria-pressed={isTemporaryChat}
            title={isTemporaryChat ? 'Exit temporary chat' : 'Temporary chat'}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
              isTemporaryChat
                ? 'bg-[#004a77] text-[#c2e7ff]'
                : 'text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
            }`}
          >
            <TemporaryChatIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer (Material 3 Dark Surface #1e1f20) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => onToggleMobileMenu(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              role="dialog"
              aria-label="Navigation menu"
              className="relative z-10 flex flex-col justify-between w-[300px] max-w-[85vw] h-full bg-[#1e1f20] px-3 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] shadow-[12px_0_40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                  <div className="flex items-center gap-2.5 pl-1">
                    <GeminiBrandSparkle className="w-[20px] h-[20px]" />
                    <span className="text-[18px] font-normal text-[#e3e3e3]">Gemini</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleMobileMenu(false)}
                    aria-label="Close menu"
                    className="flex items-center justify-center w-11 h-11 rounded-full text-[#c4c7c5] active:bg-[#e3e3e3]/[0.1] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Material 3 Tonal New Chat Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav('new');
                    onToggleMobileMenu(false);
                  }}
                  className="inline-flex items-center gap-3 self-start h-11 px-4 mb-4 rounded-full bg-[#282a2c] active:bg-[#333537] text-[14px] font-medium text-[#e3e3e3] transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-[18px] h-[18px] text-[#c4c7c5]" />
                  <span>New chat</span>
                </button>

                {/* Primary Mobile Links */}
                <nav className="flex flex-col gap-0.5 shrink-0">
                  {RAIL_ITEMS.filter((item) => item.id !== 'new').map(({ id, label, icon: Icon }) => {
                    const isActive = activeNav === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          onSelectNav(id);
                          onToggleMobileMenu(false);
                        }}
                        className={`flex items-center gap-3.5 w-full min-h-[44px] px-3.5 rounded-full text-[14px] font-medium transition-colors duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-[#004a77] text-[#c2e7ff]'
                            : 'text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08]'
                        }`}
                      >
                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isActive ? 'text-[#c2e7ff]' : 'text-[#c4c7c5]'
                          }`}
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile Recent Chats */}
                <div className="mt-4 pt-3 border-t border-white/[0.08] flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <div className="px-3.5 text-[12px] font-medium text-[#8e918f] mb-1.5">
                    Recent
                  </div>
                  {sessions.length === 0 ? (
                    <p className="px-3.5 py-2 text-[13px] text-[#8e918f]">
                      No recent chats yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => {
                            onSelectSession(session.id);
                            onToggleMobileMenu(false);
                          }}
                          className={`flex items-center gap-3 w-full min-h-[44px] px-3.5 rounded-full text-left text-[14px] transition-colors cursor-pointer ${
                            session.id === activeSessionId
                              ? 'bg-[#004a77] text-[#c2e7ff] font-medium'
                              : 'text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08]'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 opacity-70 shrink-0" />
                          <span className="truncate flex-1">{session.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav('settings');
                    onToggleMobileMenu(false);
                  }}
                  className="flex items-center gap-3.5 w-full min-h-[44px] px-3.5 rounded-full text-[14px] font-medium text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                >
                  <Settings className="w-[18px] h-[18px] text-[#c4c7c5]" />
                  <span>Settings</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
