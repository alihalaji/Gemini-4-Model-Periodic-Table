import React, { useId } from 'react';

const GEMINI_STAR_PATH =
  'M14 1.5C14 8.40356 19.5964 14 26.5 14C19.5964 14 14 19.5964 14 26.5C14 19.5964 8.40356 14 1.5 14C8.40356 14 14 8.40356 14 1.5Z';

export const GeminiBrandSparkle: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`gem-base-${uid}`} x1="3" y1="25" x2="25" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBC04" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
        <radialGradient id={`gem-red-${uid}`} cx="0.22" cy="0.22" r="0.65">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="58%" stopColor="#EA4335" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#EA4335" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gem-yellow-${uid}`} cx="0.22" cy="0.82" r="0.64">
          <stop offset="0%" stopColor="#FBBC04" />
          <stop offset="58%" stopColor="#FBBC04" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#FBBC04" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gem-green-${uid}`} cx="0.82" cy="0.82" r="0.64">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="58%" stopColor="#34A853" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#34A853" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gem-blue-${uid}`} cx="0.82" cy="0.18" r="0.7">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="62%" stopColor="#4285F4" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={GEMINI_STAR_PATH} fill={`url(#gem-base-${uid})`} />
      <path d={GEMINI_STAR_PATH} fill={`url(#gem-red-${uid})`} />
      <path d={GEMINI_STAR_PATH} fill={`url(#gem-yellow-${uid})`} />
      <path d={GEMINI_STAR_PATH} fill={`url(#gem-green-${uid})`} />
      <path d={GEMINI_STAR_PATH} fill={`url(#gem-blue-${uid})`} />
    </svg>
  );
};

export const SparkleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`sparkle-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2E7FF" />
          <stop offset="50%" stopColor="#8AB4F8" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
        fill={`url(#sparkle-grad-${uid})`}
      />
    </svg>
  );
};

export const TemporaryChatIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3a9 9 0 0 1 8.48 6" strokeDasharray="2.5 3.4" />
    <path
      d="M20.48 15A9 9 0 0 1 12 21a8.96 8.96 0 0 1-4.88-1.44L3 20.5l.94-4.12A9 9 0 0 1 12 3"
      strokeDasharray="2.5 3.4"
    />
    <path d="M9.5 14.5 15 9l1.5 1.5L11 16l-2 .5.5-2Z" />
  </svg>
);

export const ComposeChatIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6" />
    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.375-9.375Z" />
  </svg>
);
