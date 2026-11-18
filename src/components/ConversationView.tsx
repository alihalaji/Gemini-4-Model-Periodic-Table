import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronDown, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ThinkingLevel, WorkspaceMode } from '../data/elements';
import { GeminiBrandSparkle } from './Icons';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: string[];
  modelLabel?: string;
  thinkingLevel?: ThinkingLevel;
  thinkingSummary?: string;
  mode?: WorkspaceMode;
}

interface ConversationViewProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onRegenerate: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  isThinking,
  onRegenerate,
}) => {
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down' | null>>({});

  const toggleThinking = (id: string) => {
    setExpandedThinkingIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard permission denials in restricted frames
    }
  };

  const toggleFeedback = (id: string, vote: 'up' | 'down') => {
    setFeedbackMap((prev) => ({
      ...prev,
      [id]: prev[id] === vote ? null : vote,
    }));
  };

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-7 pb-8">
      {messages.map((msg, idx) => {
        if (msg.role === 'user') {
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              className="flex flex-col items-end gap-1.5"
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1.5">
                  {msg.attachments.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-[#1e1f20] px-3 py-1 text-[12px] text-[#c4c7c5]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              <div className="max-w-[85%] rounded-[24px] rounded-tr-[4px] bg-[#282a2c] px-4 py-3 text-[15px] leading-relaxed text-[#e3e3e3]">
                {msg.content}
              </div>
            </motion.div>
          );
        }

        const isExpanded = Boolean(expandedThinkingIds[msg.id]);
        const isLastModel = idx === messages.length - 1;
        const vote = feedbackMap[msg.id];

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="flex items-start gap-3.5"
          >
            <div className="mt-0.5 shrink-0">
              <GeminiBrandSparkle className="w-[22px] h-[22px]" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Google Gemini inline Show thinking disclosure */}
              {msg.thinkingSummary && (
                <div className="mb-2.5">
                  <button
                    type="button"
                    onClick={() => toggleThinking(msg.id)}
                    aria-expanded={isExpanded}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#c4c7c5] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                  >
                    <span>Show thinking</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pl-3 border-l border-white/[0.12] text-[13px] leading-relaxed text-[#8e918f]">
                      {msg.thinkingSummary}
                    </div>
                  )}
                </div>
              )}

              {/* Response Prose */}
              <div className="text-[15.5px] leading-[1.7] text-[#e3e3e3] whitespace-pre-line">
                {msg.content}
              </div>

              {/* Authentic Google Gemini Message Action Row */}
              <div className="mt-2.5 -ml-1.5 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleFeedback(msg.id, 'up')}
                  aria-label="Good response"
                  aria-pressed={vote === 'up'}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer ${
                    vote === 'up'
                      ? 'text-[#a8c7fa] bg-[#a8c7fa]/[0.12]'
                      : 'text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
                  }`}
                >
                  <ThumbsUp className="w-[15px] h-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFeedback(msg.id, 'down')}
                  aria-label="Bad response"
                  aria-pressed={vote === 'down'}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer ${
                    vote === 'down'
                      ? 'text-[#a8c7fa] bg-[#a8c7fa]/[0.12]'
                      : 'text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08]'
                  }`}
                >
                  <ThumbsDown className="w-[15px] h-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  aria-label="Copy response"
                  title="Copy"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-[15px] h-[15px] text-[#a8c7fa]" />
                  ) : (
                    <Copy className="w-[15px] h-[15px]" />
                  )}
                </button>
                {isLastModel && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    aria-label="Redo response"
                    title="Redo"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-[15px] h-[15px]" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Subtle Gemini Thinking Indicator */}
      {isThinking && (
        <div className="flex items-center gap-3.5">
          <GeminiBrandSparkle className="w-[22px] h-[22px] animate-spin [animation-duration:2.6s]" />
          <span className="text-[14px] text-[#8e918f]">Just a sec…</span>
        </div>
      )}
    </div>
  );
};
