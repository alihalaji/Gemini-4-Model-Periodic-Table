import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  ChevronDown,
  Code2,
  FileText,
  FolderGit2,
  Image as ImageIcon,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  X,
} from 'lucide-react';
import { ThinkingLevel, WorkspaceMode } from '../data/elements';

export interface AttachedFile {
  id: string;
  name: string;
  kind: 'file' | 'image' | 'code';
}

interface ComposerProps {
  promptValue: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  selectedLabel: string;
  selectedSymbol?: string | null;
  showSymbolInBar?: boolean;
  thinkingLevel: ThinkingLevel;
  workspaceMode: WorkspaceMode;
  isPopupOpen: boolean;
  onTogglePopup: () => void;
  pillButtonRef: React.RefObject<HTMLButtonElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  attachments: AttachedFile[];
  onAddAttachment: (file: AttachedFile) => void;
  onRemoveAttachment: (id: string) => void;
  onNotify: (msg: string) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechRecognitionResultLike;
    length: number;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  promptValue,
  onPromptChange,
  onSubmit,
  selectedLabel,
  selectedSymbol,
  showSymbolInBar = false,
  thinkingLevel,
  workspaceMode,
  isPopupOpen,
  onTogglePopup,
  pillButtonRef,
  inputRef,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onNotify,
}) => {
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isMobileAttachSheetOpen, setIsMobileAttachSheetOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!isAttachMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setIsAttachMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAttachMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isAttachMenuOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    onAddAttachment({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      kind: isImg ? 'image' : 'file',
    });
    e.target.value = '';
    setIsAttachMenuOpen(false);
    setIsMobileAttachSheetOpen(false);
    inputRef.current?.focus();
  };

  const handleToggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      onNotify('Voice input is not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length })
          .map((_, idx) => event.results[idx]?.[0]?.transcript ?? '')
          .join('');
        onPromptChange(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      onNotify('Microphone access unavailable');
    }
  };

  const hasTypedPrompt = promptValue.trim().length > 0 || attachments.length > 0;

  return (
    <>
      <form
        onSubmit={onSubmit}
        className={`w-full bg-[#1e1f20] transition-colors duration-150 focus-within:bg-[#222326] shadow-[0_4px_20px_rgba(0,0,0,0.35)] ${
          attachments.length > 0
            ? 'rounded-[28px] px-3.5 py-2.5'
            : 'rounded-[28px] sm:rounded-full px-3 sm:px-4 pt-2.5 pb-2 sm:py-0 sm:min-h-[58px]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Attached File Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2 px-1">
            {attachments.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#282a2c] pl-2.5 pr-1.5 py-1 text-[12px] text-[#e3e3e3]"
              >
                {file.kind === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-[#c4c7c5]" />
                ) : file.kind === 'code' ? (
                  <Code2 className="w-3.5 h-3.5 text-[#c4c7c5]" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#c4c7c5]" />
                )}
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="flex items-center justify-center w-5 h-5 rounded-full text-[#c4c7c5] hover:text-white hover:bg-white/[0.1] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Desktop single-row / Mobile two-row layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 sm:min-h-[58px]">
          <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-2.5">
            {/* Desktop "+" Attachment Menu */}
            <div ref={attachMenuRef} className="relative hidden sm:block shrink-0">
              <button
                type="button"
                aria-label="Add files"
                aria-expanded={isAttachMenuOpen}
                onClick={() => setIsAttachMenuOpen((prev) => !prev)}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                  isAttachMenuOpen
                    ? 'bg-[#e3e3e3]/[0.12] text-[#e3e3e3]'
                    : 'text-[#c4c7c5] hover:bg-[#e3e3e3]/[0.08] hover:text-[#e3e3e3]'
                }`}
              >
                <Plus className="w-[19px] h-[19px]" />
              </button>

              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
                    className="absolute left-0 bottom-[calc(100%+10px)] z-50 w-[200px] rounded-[16px] bg-[#282a2c] p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 w-full rounded-[12px] px-3 py-2.5 text-[13px] text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-[#c4c7c5]" />
                      <span>Upload files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-3 w-full rounded-[12px] px-3 py-2.5 text-[13px] text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#c4c7c5]" />
                      <span>Add photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddAttachment({
                          id: `code-${Date.now()}`,
                          name: 'workspace-repo.zip',
                          kind: 'code',
                        });
                        setIsAttachMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full rounded-[12px] px-3 py-2.5 text-[13px] text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                    >
                      <FolderGit2 className="w-4 h-4 text-[#c4c7c5]" />
                      <span>Import code</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening...'
                  : workspaceMode === 'Chat'
                    ? 'Ask Gemini'
                    : 'Describe a task for Gemini'
              }
              aria-label={workspaceMode === 'Chat' ? 'Ask Gemini' : 'Describe a task for Gemini'}
              className="flex-1 min-w-0 bg-transparent px-2 sm:px-0 min-h-[40px] sm:min-h-0 py-1 text-[16px] text-[#e3e3e3] placeholder-[#8e918f] outline-none"
            />
          </div>

          {/* Bottom row on mobile / Right controls on desktop */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="Add attachment"
              onClick={() => setIsMobileAttachSheetOpen(true)}
              className="flex sm:hidden items-center justify-center w-10 h-10 -ml-1 shrink-0 rounded-full text-[#c4c7c5] active:bg-[#e3e3e3]/[0.1] hover:text-[#e3e3e3] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
            >
              <Plus className="w-[20px] h-[20px]" />
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Inline Model Trigger matching screenshot: "Neon Medium v" */}
              <button
                ref={pillButtonRef}
                type="button"
                onClick={onTogglePopup}
                aria-haspopup="dialog"
                aria-expanded={isPopupOpen}
                aria-label={`Select model, current model ${selectedLabel}, thinking level ${thinkingLevel}`}
                className={`inline-flex items-center gap-1.5 h-10 sm:h-9 px-3 rounded-full text-[14px] leading-none whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                  isPopupOpen
                    ? 'bg-[#e3e3e3]/[0.12] text-[#e3e3e3]'
                    : 'hover:bg-[#e3e3e3]/[0.08] active:bg-[#e3e3e3]/[0.12]'
                }`}
              >
                {showSymbolInBar && selectedSymbol && (
                  <span className="text-[11px] font-medium text-[#8e918f] tabular-nums">
                    {selectedSymbol}
                  </span>
                )}
                <span className="font-medium text-[#e3e3e3] max-w-[116px] sm:max-w-[150px] truncate">
                  {selectedLabel}
                </span>
                {thinkingLevel !== 'Off' && (
                  <span className="font-normal text-[#8e918f]">{thinkingLevel}</span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#c4c7c5] transition-transform duration-150 ${
                    isPopupOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Google Material 3 Send / Voice Button */}
              {hasTypedPrompt ? (
                <button
                  type="submit"
                  aria-label="Send prompt"
                  className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded-full bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#062e6f] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
                >
                  <ArrowUp className="w-[19px] h-[19px] sm:w-[18px] sm:h-[18px]" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={isListening ? 'Stop voice input' : 'Use microphone'}
                  onClick={handleToggleVoice}
                  className={`flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                    isListening
                      ? 'bg-[#004a77] text-[#c2e7ff]'
                      : 'text-[#c4c7c5] active:bg-[#e3e3e3]/[0.1] hover:bg-[#e3e3e3]/[0.08] hover:text-[#e3e3e3]'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-[19px] h-[19px] sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <Mic className="w-[19px] h-[19px] sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Authentic Google Material 3 Mobile Attachment Sheet (Clean list rows, zero boxed cards) */}
      <AnimatePresence>
        {isMobileAttachSheetOpen && (
          <div className="sm:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setIsMobileAttachSheetOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 70 || info.velocity.y > 400) {
                  setIsMobileAttachSheetOpen(false);
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Add attachment"
              className="fixed inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-[#1e1f20] px-3 pt-2.5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.75)]"
            >
              <div className="flex justify-center py-2 mb-1" aria-hidden="true">
                <div className="w-8 h-1 rounded-full bg-[#8e918f]/50" />
              </div>

              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 w-full min-h-[52px] px-4 rounded-2xl text-[15px] text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                >
                  <Paperclip className="w-5 h-5 text-[#c4c7c5]" />
                  <span>Upload files</span>
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-4 w-full min-h-[52px] px-4 rounded-2xl text-[15px] text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-[#c4c7c5]" />
                  <span>Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddAttachment({
                      id: `code-${Date.now()}`,
                      name: 'workspace-repo.zip',
                      kind: 'code',
                    });
                    setIsMobileAttachSheetOpen(false);
                  }}
                  className="flex items-center gap-4 w-full min-h-[52px] px-4 rounded-2xl text-[15px] text-[#e3e3e3] active:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                >
                  <FolderGit2 className="w-5 h-5 text-[#c4c7c5]" />
                  <span>Import code</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
