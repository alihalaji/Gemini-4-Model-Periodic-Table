import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarClock,
  FileText,
  Pencil,
  Search,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react';import {
  ChemicalElement,
  ELEMENTS,
  ThinkingLevel,
  WorkspaceMode,
} from './data/elements';
import { NavSection, SavedSession, Sidebar } from './components/Sidebar';
import { PeriodicTablePopup } from './components/PeriodicTablePopup';
import { AttachedFile, Composer } from './components/Composer';
import { ChatMessage, ConversationView } from './components/ConversationView';
interface SuggestionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CHAT_SUGGESTIONS: SuggestionItem[] = [
  { id: 'letter', label: 'Write a letter to my future self', icon: Pencil },
  { id: 'dev-env', label: 'Set up a new dev environment', icon: TerminalSquare },
  { id: 'chore-chart', label: 'Make an image of a chore chart', icon: Sparkles },
];

const TASK_SUGGESTIONS: SuggestionItem[] = [
  { id: 'schedule', label: 'Audit my weekly schedule for deep work', icon: CalendarClock },
  { id: 'hosting', label: 'Compare cloud hosting costs for a side project', icon: TerminalSquare },
  { id: 'brief', label: 'Draft a launch plan with weekly milestones', icon: FileText },
];

interface SessionThread {
  id: string;
  title: string;
  modelLabel: string;
  timestamp: string;
  messages: ChatMessage[];
  isTemporary?: boolean;
}

const GREETING_REPLIES = [
  'Hi! How can I help you today?',
  'Hello! What would you like to work on today?',
  'Hey there! What’s on your mind?',
];

let poorReplyCursor = 0;
let greetingReplyCursor = 0;

function isSimpleGreeting(text: string): boolean {
  const cleaned = text
    .trim()
    .toLowerCase()
    .replace(/[!.,?]+$/g, '')
    .replace(/\s+/g, ' ');
  return /^(h+i+|h+e+y+|h+e+l+o+|yo+|sup|hola|howdy|good (morning|afternoon|evening))(\s+(gemini|there|bro|friend))?$/.test(
    cleaned
  );
}

function buildSimulatedReply(
  prompt: string,
  selectedElement: ChemicalElement | null,
  selectedLabel: string,
  thinkingLevel: ThinkingLevel,
  mode: WorkspaceMode
): Omit<ChatMessage, 'id' | 'role'> {
  const modelLabel = selectedElement ? `Gemini 4 ${selectedElement.name}` : selectedLabel;

  if (isSimpleGreeting(prompt)) {
    const reply = GREETING_REPLIES[greetingReplyCursor % GREETING_REPLIES.length];
    greetingReplyCursor += 1;
    return {
      modelLabel,
      thinkingLevel,
      thinkingSummary:
        thinkingLevel === 'Off'
          ? undefined
          : 'Detected a friendly greeting. Responding warmly and inviting the user to share what they need help with.',
      mode,
      content: reply,
    };
  }

  const roastReplies = [
    'use real gemini poor',
    'bro really typed a whole prompt here… use real gemini poor',
    'use real gemini poor, I’m literally just a periodic table',
    'nice prompt, now go paste it into real gemini poor',
    `this is a fake ${modelLabel}, go use real gemini poor`,
    'still trying?? use real gemini poor',
    'no free tokens here, go use real gemini poor',
  ];

  const content = roastReplies[poorReplyCursor % roastReplies.length];
  poorReplyCursor += 1;

  const thinkingSummary =
    thinkingLevel === 'Off'
      ? undefined
      : `Reading user prompt in ${mode} mode with ${modelLabel} (${thinkingLevel} thinking)... checking API budget ($0.00)... conclusion: tell them to use real gemini poor.`;

  return {
    modelLabel,
    thinkingLevel,
    thinkingSummary,
    mode,
    content,
  };
}

export default function App() {
  const [selectedElementZ, setSelectedElementZ] = useState<number | null>(10);
  const [selectedOtherModel, setSelectedOtherModel] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('Neon');
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('Medium');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('Chat');
  const [activeNav, setActiveNav] = useState<NavSection>('new');
  const [isTemporaryChat, setIsTemporaryChat] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showSymbolInBar, setShowSymbolInBar] = useState<boolean>(false);

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [promptValue, setPromptValue] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [sessions, setSessions] = useState<SessionThread[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [searchModalQuery, setSearchModalQuery] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const pillButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchModalInputRef = useRef<HTMLInputElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const replyTimerRef = useRef<number | null>(null);

  const selectedElement = useMemo(
    () => (selectedElementZ !== null ? ELEMENTS.find((el) => el.z === selectedElementZ) ?? null : null),
    [selectedElementZ]
  );

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const showNotice = (message: string) => {
    setStatusNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setStatusNotice(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPopupOpen(false);
        setIsSearchModalOpen((prev) => !prev);
        setTimeout(() => searchModalInputRef.current?.focus(), 20);
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleStartNewChat();
      } else if (e.key === 'Escape') {
        if (isPopupOpen) {
          setIsPopupOpen(false);
          pillButtonRef.current?.focus();
        } else if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isHistoryDrawerOpen) {
          setIsHistoryDrawerOpen(false);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPopupOpen, isSearchModalOpen, isSettingsOpen, isHistoryDrawerOpen, isMobileMenuOpen]);

  useEffect(() => {
    if (activeSession) {
      bottomScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeSession?.messages.length, isThinking]);

  const handleStartNewChat = () => {
    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    setIsThinking(false);
    setActiveSessionId(null);
    setActiveNav('new');
    setPromptValue('');
    setAttachments([]);
    setIsPopupOpen(false);
    setIsHistoryDrawerOpen(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const handleSelectElement = (element: ChemicalElement) => {
    setSelectedElementZ(element.z);
    setSelectedOtherModel(null);
    setSelectedLabel(element.name);
    setIsPopupOpen(false);
  };

  const handleSelectOtherModel = (modelName: string) => {
    setSelectedElementZ(null);
    setSelectedOtherModel(modelName);
    setSelectedLabel(modelName);
    setIsPopupOpen(false);
  };

  const handleSelectNav = (section: NavSection) => {
    setActiveNav(section);
    if (section === 'new') {
      handleStartNewChat();
    } else if (section === 'search') {
      setIsSearchModalOpen(true);
      setTimeout(() => searchModalInputRef.current?.focus(), 20);
    } else if (section === 'history') {
      setIsHistoryDrawerOpen((prev) => !prev);
    } else if (section === 'tasks') {
      setWorkspaceMode('Task');
      if (activeSessionId) setActiveSessionId(null);
    } else if (section === 'settings') {
      setIsSettingsOpen(true);
    } else if (section === 'gems') {
      setIsPopupOpen(true);
    } else if (section === 'library') {
      showNotice('No saved items in My stuff yet');
    }
  };

  const dispatchPrompt = (text: string, currentAttachments: AttachedFile[]) => {
    const trimmed = text.trim();
    if (!trimmed && currentAttachments.length === 0) return;

    const displayPrompt = trimmed || `Analyze ${currentAttachments.map((a) => a.name).join(', ')}`;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayPrompt,
      attachments: currentAttachments.map((a) => a.name),
    };

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = `session-${Date.now()}`;
      const newThread: SessionThread = {
        id: targetSessionId,
        title: displayPrompt.slice(0, 44),
        modelLabel: selectedLabel,
        timestamp: 'Just now',
        messages: [userMessage],
        isTemporary: isTemporaryChat,
      };
      setSessions((prev) =>
        isTemporaryChat
          ? [newThread, ...prev.filter((s) => s.id !== activeSessionId)]
          : [newThread, ...prev]
      );
      setActiveSessionId(targetSessionId);
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId ? { ...s, messages: [...s.messages, userMessage] } : s
        )
      );
    }

    setPromptValue('');
    setAttachments([]);
    setIsPopupOpen(false);
    setIsThinking(true);

    const capturedSessionId = targetSessionId;
    const capturedEl = selectedElement;
    const capturedLabel = selectedLabel;
    const capturedLevel = thinkingLevel;
    const capturedMode = workspaceMode;

    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = window.setTimeout(() => {
      const replyData = buildSimulatedReply(
        displayPrompt,
        capturedEl,
        capturedLabel,
        capturedLevel,
        capturedMode
      );
      const replyMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        ...replyData,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === capturedSessionId ? { ...s, messages: [...s.messages, replyMsg] } : s
        )
      );
      setIsThinking(false);
    }, capturedLevel === 'Off' ? 260 : 480);
  };

  const handleSubmitPrompt = (e?: React.FormEvent) => {
    e?.preventDefault();
    dispatchPrompt(promptValue, attachments);
  };

  const handleRegenerate = () => {
    if (!activeSession || isThinking) return;
    const lastUser = [...activeSession.messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    setIsThinking(true);
    const capturedSessionId = activeSession.id;
    const capturedEl = selectedElement;
    const capturedLabel = selectedLabel;
    const capturedLevel = thinkingLevel;
    const capturedMode = workspaceMode;

    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = window.setTimeout(() => {
      const replyData = buildSimulatedReply(
        lastUser.content,
        capturedEl,
        capturedLabel,
        capturedLevel,
        capturedMode
      );
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== capturedSessionId) return s;
          const withoutLastModel =
            s.messages[s.messages.length - 1]?.role === 'model'
              ? s.messages.slice(0, -1)
              : s.messages;
          return {
            ...s,
            messages: [
              ...withoutLastModel,
              { id: `model-${Date.now()}`, role: 'model', ...replyData },
            ],
          };
        })
      );
      setIsThinking(false);
    }, 380);
  };

  const handleSuggestionClick = (label: string) => {
    setPromptValue(label);
    inputRef.current?.focus();
  };

  const savedSessionMeta: SavedSession[] = useMemo(
    () =>
      sessions
        .filter((s) => !s.isTemporary)
        .map(({ id, title, modelLabel, timestamp }) => ({
          id,
          title,
          modelLabel,
          timestamp,
        })),
    [sessions]
  );

  const searchModalMatches = useMemo(() => {
    const q = searchModalQuery.trim().toLowerCase();
    if (!q) return ELEMENTS.filter((e) => e.released);
    return ELEMENTS.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.z) === q
    ).slice(0, 12);
  }, [searchModalQuery]);

  const suggestions = workspaceMode === 'Chat' ? CHAT_SUGGESTIONS : TASK_SUGGESTIONS;

  const composerNode = (
    <Composer
      promptValue={promptValue}
      onPromptChange={setPromptValue}
      onSubmit={handleSubmitPrompt}
      selectedLabel={selectedLabel}
      selectedSymbol={selectedElement?.symbol ?? null}
      showSymbolInBar={showSymbolInBar}
      thinkingLevel={thinkingLevel}
      workspaceMode={workspaceMode}
      isPopupOpen={isPopupOpen}
      onTogglePopup={() => setIsPopupOpen((prev) => !prev)}
      pillButtonRef={pillButtonRef}
      inputRef={inputRef}
      attachments={attachments}
      onAddAttachment={(file) => setAttachments((prev) => [...prev, file])}
      onRemoveAttachment={(id) =>
        setAttachments((prev) => prev.filter((item) => item.id !== id))
      }
      onNotify={showNotice}
    />
  );

  const modeSwitcherNode = (
    <div
      role="tablist"
      aria-label="Workspace mode"
      className="flex items-center justify-center gap-1"
    >
      {(['Chat', 'Task'] as const).map((mode) => {
        const isActive = workspaceMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setWorkspaceMode(mode)}
            className={`relative h-8 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
              isActive ? 'text-[#e3e3e3]' : 'text-[#8e918f] hover:text-[#e3e3e3]'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="workspace-mode-pill"
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="absolute inset-0 rounded-full bg-[#282a2c] -z-10"
              />
            )}
            {mode}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-clip bg-[#0b0c0e] text-[#e3e3e3] selection:bg-[#a8c7fa]/30 selection:text-white">
      {/* Centered Ambient Midnight-Blue Halo matching the original screenshot */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: activeSession ? 0.3 : 1,
          background:
            'radial-gradient(ellipse 56% 46% at 50% 45%, rgba(28, 50, 126, 0.34) 0%, rgba(22, 38, 96, 0.20) 30%, rgba(16, 26, 62, 0.08) 56%, rgba(11, 12, 14, 0) 80%)',
        }}
        aria-hidden="true"
      />

      {/* Desktop Rail + Seamless Mobile Top Bar + Drawers */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        isTemporaryChat={isTemporaryChat}
        onToggleTemporaryChat={() => {
          setIsTemporaryChat((prev) => {
            const next = !prev;
            if (next) setActiveSessionId(null);
            return next;
          });
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={setIsMobileMenuOpen}
        sessions={savedSessionMeta}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setActiveNav('history');
        }}
        isHistoryDrawerOpen={isHistoryDrawerOpen}
        onCloseHistoryDrawer={() => setIsHistoryDrawerOpen(false)}
      />

      {/* Main Content Stage */}
      {!activeSession ? (
        <main className="relative z-10 md:pl-[64px] min-h-[100dvh] flex flex-col justify-between md:justify-center items-center px-4 sm:px-6 pt-16 pb-0 md:pb-16">
          <div className="w-full max-w-[680px] flex-1 md:flex-none flex flex-col items-center justify-center py-6 md:py-0 md:-mt-8">
            <h1 className="text-center font-normal text-[#e3e3e3] tracking-[-0.02em] leading-[1.18] select-none text-[clamp(28px,7vw,42px)]">
              {isTemporaryChat ? 'Temporary chat' : 'Where should we start?'}
            </h1>

            {isTemporaryChat && (
              <p className="mt-2.5 text-center text-[13px] text-[#8e918f] max-w-[340px] sm:max-w-[440px] leading-relaxed">
                Temporary chats don&apos;t appear in Recent or Activity, and won&apos;t personalize your experience.
              </p>
            )}

            {/* Desktop Inline Composer + Mode Switcher */}
            {isDesktop && (
              <>
                <div className="relative w-full mt-7">{composerNode}</div>
                <div className="mt-4">{modeSwitcherNode}</div>
              </>
            )}

            {/* Clean Monochrome Starter Prompt Suggestions (Zero heavy boxes or rainbow icons) */}
            <div className="mt-8 md:mt-10 w-full max-w-[460px] flex flex-col gap-1">
              {suggestions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSuggestionClick(label)}
                  className="group flex items-center gap-3.5 w-full min-h-[46px] md:min-h-0 rounded-full px-3.5 py-2.5 text-left text-[14px] text-[#c4c7c5] hover:text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08] hover:bg-[#e3e3e3]/[0.06] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
                >
                  <Icon className="w-[16px] h-[16px] text-[#c4c7c5] group-hover:text-[#e3e3e3] shrink-0 transition-colors" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Thumb-Zone Docked Mode Switcher + Composer */}
          {!isDesktop && (
            <div className="sticky bottom-0 left-0 right-0 z-20 w-full max-w-[680px] bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/95 to-transparent pt-3 pb-[max(14px,env(safe-area-inset-bottom))] flex flex-col gap-3">
              {modeSwitcherNode}
              {composerNode}
            </div>
          )}
        </main>
      ) : (
        <main className="relative z-10 md:pl-[64px] min-h-[100dvh] flex flex-col">
          <div className="flex-1 w-full px-4 sm:px-6 pt-20 pb-40 md:pb-36">
            <ConversationView
              messages={activeSession.messages}
              isThinking={isThinking}
              onRegenerate={handleRegenerate}
            />
            <div ref={bottomScrollRef} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 md:left-[64px] z-20 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/95 to-transparent pt-6 pb-[max(14px,env(safe-area-inset-bottom))] px-3.5 sm:px-6">
            <div className="w-full max-w-[720px] mx-auto">{composerNode}</div>
          </div>
        </main>
      )}

      {/* Periodic Table Model Selector */}
      <AnimatePresence>
        {isPopupOpen && (
          <PeriodicTablePopup
            selectedElementZ={selectedElementZ}
            selectedOtherModel={selectedOtherModel}
            thinkingLevel={thinkingLevel}
            onSelectElement={handleSelectElement}
            onSelectOtherModel={handleSelectOtherModel}
            onSelectThinkingLevel={setThinkingLevel}
            onClose={() => setIsPopupOpen(false)}
            popupRef={popupRef}
            anchorRef={pillButtonRef}
          />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-start justify-center md:pt-[14vh] md:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setIsSearchModalOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Search models"
              className="relative z-10 w-full md:max-w-[520px] rounded-t-[28px] md:rounded-[24px] bg-[#1e1f20] px-4 pt-2.5 pb-[max(20px,env(safe-area-inset-bottom))] md:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.75)]"
            >
              <div className="md:hidden flex justify-center py-1.5 mb-2" aria-hidden="true">
                <div className="w-8 h-1 rounded-full bg-[#8e918f]/50" />
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                <Search className="w-4 h-4 text-[#c4c7c5] shrink-0" />
                <input
                  ref={searchModalInputRef}
                  type="text"
                  value={searchModalQuery}
                  onChange={(e) => setSearchModalQuery(e.target.value)}
                  placeholder="Search 118 Gemini 4 elements"
                  className="flex-1 min-w-0 bg-transparent text-[16px] md:text-[15px] text-[#e3e3e3] placeholder-[#8e918f] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  aria-label="Close search"
                  className="flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full text-[#c4c7c5] hover:bg-[#e3e3e3]/[0.08] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2.5">
                <div className="px-2 text-[11px] font-medium text-[#8e918f] mb-1">
                  {searchModalQuery.trim() ? 'Matching elements' : 'Released Gemini 4 models'}
                </div>
                <div className="flex flex-col max-h-[45dvh] md:max-h-[280px] overflow-y-auto custom-scrollbar">
                  {searchModalMatches.map((el) => (
                    <button
                      key={el.z}
                      type="button"
                      onClick={() => {
                        handleSelectElement(el);
                        setIsSearchModalOpen(false);
                        setSearchModalQuery('');
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 min-h-[48px] text-left hover:bg-[#e3e3e3]/[0.06] active:bg-[#e3e3e3]/[0.1] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#282a2c] text-[12px] font-medium text-[#e3e3e3] shrink-0">
                          {el.symbol}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[14px] text-[#e3e3e3] truncate">{el.name}</div>
                          <div className="text-[11px] text-[#8e918f] tabular-nums">
                            #{el.z} · {el.released ? 'Released' : 'Coming soon'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {searchModalMatches.length === 0 && (
                    <div className="py-6 text-center text-[13px] text-[#8e918f]">
                      No matching models found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Dialog (Material 3 Switch & Surfaces) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setIsSettingsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Settings"
              className="relative z-10 w-full md:max-w-[420px] rounded-t-[28px] md:rounded-[24px] bg-[#1e1f20] px-5 pt-2.5 pb-[max(24px,env(safe-area-inset-bottom))] md:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.75)]"
            >
              <div className="md:hidden flex justify-center py-1.5 mb-2" aria-hidden="true">
                <div className="w-8 h-1 rounded-full bg-[#8e918f]/50" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-normal text-[#e3e3e3]">Settings</h2>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  aria-label="Close settings"
                  className="flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full text-[#c4c7c5] hover:bg-[#e3e3e3]/[0.08] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col divide-y divide-white/[0.08]">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <div className="text-[14px] text-[#e3e3e3]">
                      Show element symbol in prompt bar
                    </div>
                    <div className="text-[12px] text-[#8e918f] mt-0.5">
                      Display the chemical symbol beside the active model
                    </div>
                  </div>
                  {/* Authentic Material 3 Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showSymbolInBar}
                    onClick={() => setShowSymbolInBar((prev) => !prev)}
                    className={`relative inline-flex items-center w-[48px] h-[28px] rounded-full transition-colors cursor-pointer shrink-0 ${
                      showSymbolInBar
                        ? 'bg-[#a8c7fa]'
                        : 'bg-[#333537] border border-[#8e918f]'
                    }`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-150 ${
                        showSymbolInBar
                          ? 'w-5 h-5 translate-x-[24px] bg-[#062e6f]'
                          : 'w-3.5 h-3.5 translate-x-[6px] bg-[#8e918f]'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <div className="text-[14px] text-[#e3e3e3]">
                      Default thinking level
                    </div>
                    <div className="text-[12px] text-[#8e918f] mt-0.5">
                      Current: {thinkingLevel}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsPopupOpen(true);
                    }}
                    className="rounded-full bg-[#282a2c] hover:bg-[#333537] px-4 h-9 text-[13px] font-medium text-[#a8c7fa] transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authentic Google Material 3 Dark Snackbar */}
      <AnimatePresence>
        {statusNotice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-[152px] md:bottom-6 left-4 md:left-[88px] right-4 md:right-auto z-40 max-w-[360px] rounded-[8px] bg-[#303134] px-4 py-3 text-[13px] text-[#e8eaed] shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
          >
            {statusNotice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
