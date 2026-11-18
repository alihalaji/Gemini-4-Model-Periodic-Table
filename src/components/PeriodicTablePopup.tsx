import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Search, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  ACTINIDES,
  ChemicalElement,
  ELEMENTS,
  LANTHANIDES,
  MAIN_ELEMENTS,
  OTHER_MODELS,
  RELEASED_COUNT,
  RELEASED_ELEMENTS,
  THINKING_LEVELS,
  ThinkingLevel,
  getElementFamily,
} from '../data/elements';
import { SparkleIcon } from './Icons';

type MobileTab = 'table' | 'list';
type LegendFilter = 'all' | 'released' | 'upcoming';

const GROUP_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1);
const PERIOD_NUMBERS = Array.from({ length: 7 }, (_, i) => i + 1);

// Crisp Google Material 3 tonal surfaces — zero neon outer glow, zero glossy bevels
const getReleasedTheme = (variant: ChemicalElement['releasedVariant'], isSelected: boolean) => {
  if (variant === 'blue') {
    return {
      cell: isSelected
        ? 'bg-[rgba(138,180,248,0.32)] border-[#a8c7fa] ring-1 ring-[#a8c7fa]/50'
        : 'bg-[rgba(138,180,248,0.20)] hover:bg-[rgba(138,180,248,0.28)] border-[#5b8def]',
      tile: 'bg-[rgba(138,180,248,0.22)] border-[#5b8def] text-[#d2e3fc]',
      accentText: 'text-[#a8c7fa]',
    };
  }
  if (variant === 'purple') {
    return {
      cell: isSelected
        ? 'bg-[rgba(168,120,220,0.36)] border-[#d6bbfb] ring-1 ring-[#d6bbfb]/50'
        : 'bg-[rgba(168,120,220,0.24)] hover:bg-[rgba(168,120,220,0.32)] border-[#a070d8]',
      tile: 'bg-[rgba(168,120,220,0.24)] border-[#a070d8] text-[#e9d5ff]',
      accentText: 'text-[#d6bbfb]',
    };
  }
  if (variant === 'green') {
    return {
      cell: isSelected
        ? 'bg-[rgba(80,180,140,0.34)] border-[#7ce0bc] ring-1 ring-[#7ce0bc]/50'
        : 'bg-[rgba(80,180,140,0.22)] hover:bg-[rgba(80,180,140,0.30)] border-[#4fb391]',
      tile: 'bg-[rgba(80,180,140,0.22)] border-[#4fb391] text-[#bbf7d0]',
      accentText: 'text-[#86efac]',
    };
  }
  return {
    cell: isSelected
      ? 'bg-[rgba(251,146,60,0.34)] border-[#fdba74] ring-1 ring-[#fdba74]/50'
      : 'bg-[rgba(251,146,60,0.22)] hover:bg-[rgba(251,146,60,0.30)] border-[#f97316]',
    tile: 'bg-[rgba(251,146,60,0.22)] border-[#f97316] text-[#ffedd5]',
    accentText: 'text-[#fdba74]',
  };
};

interface ElementCellProps {
  element: ChemicalElement;
  isSelected: boolean;
  isInspected: boolean;
  isDimmed: boolean;
  isHighlighted: boolean;
  onSelect: (element: ChemicalElement) => void;
  onHover: (element: ChemicalElement | null) => void;
  gridColumn: number;
  gridRow: number;
  mode: 'desktop' | 'mobile-fit' | 'mobile-zoom';
}

const ElementCell: React.FC<ElementCellProps> = ({
  element,
  isSelected,
  isInspected,
  isDimmed,
  isHighlighted,
  onSelect,
  onHover,
  gridColumn,
  gridRow,
  mode,
}) => {
  const releasedTheme = element.released
    ? getReleasedTheme(element.releasedVariant, isSelected || isInspected)
    : null;

  const baseSurface = releasedTheme
    ? releasedTheme.cell
    : isSelected || isInspected
      ? 'bg-[#333537] border-[#e3e3e3]/75 ring-1 ring-white/20'
      : 'bg-[#26272b] hover:bg-[#313338] border-white/[0.06] hover:border-white/[0.18]';

  const isFit = mode === 'mobile-fit';
  const isZoom = mode === 'mobile-zoom';

  return (
    <button
      type="button"
      onClick={() => onSelect(element)}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(element)}
      onBlur={() => onHover(null)}
      aria-label={`${element.name}, atomic number ${element.z}${element.released ? ', released' : ', coming soon'}`}
      aria-pressed={isSelected}
      title={`${element.z} ${element.name} (${element.symbol})`}
      style={{ gridColumn, gridRow }}
      className={`group relative flex flex-col items-center justify-center border transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
        isFit
          ? 'rounded-[4px] aspect-[1/1.08]'
          : isZoom
            ? 'rounded-[8px] min-h-[46px] px-0.5'
            : 'rounded-[8px] aspect-[1/0.86]'
      } ${baseSurface} ${isDimmed ? 'opacity-20' : 'opacity-100'} ${
        isHighlighted ? 'ring-1 ring-[#a8c7fa] border-[#a8c7fa]' : ''
      }`}
    >
      {!isFit && (
        <span
          className={`absolute top-[3px] left-[4px] leading-none font-normal tabular-nums ${
            isZoom ? 'text-[9px]' : 'text-[8.5px]'
          } ${element.released ? 'text-white/75' : 'text-[#8e918f]'}`}
        >
          {element.z}
        </span>
      )}

      {(isSelected || (isFit && isInspected)) && (
        <span
          className={`absolute rounded-full bg-white ${
            isFit
              ? 'top-[1.5px] right-[1.5px] w-[3px] h-[3px]'
              : 'top-[4px] right-[4px] w-[4.5px] h-[4.5px]'
          }`}
          aria-hidden="true"
        />
      )}

      <span
        className={`font-medium leading-none tracking-[-0.015em] ${
          isFit
            ? 'text-[9px]'
            : isZoom
              ? 'mt-[6px] text-[14px]'
              : 'mt-[5px] text-[14px] md:text-[15px]'
        } ${
          element.released
            ? 'text-white'
            : isSelected || isInspected
              ? 'text-white'
              : 'text-[#c4c7c5] group-hover:text-[#e3e3e3]'
        }`}
      >
        {element.symbol}
      </span>

      {isZoom && (
        <span
          className={`mt-0.5 text-[8px] leading-none truncate max-w-full px-0.5 ${
            element.released ? 'text-white/75' : 'text-[#8e918f]'
          }`}
        >
          {element.name}
        </span>
      )}
    </button>
  );
};

interface PeriodicTablePopupProps {
  selectedElementZ: number | null;
  selectedOtherModel: string | null;
  thinkingLevel: ThinkingLevel;
  onSelectElement: (element: ChemicalElement) => void;
  onSelectOtherModel: (modelName: string) => void;
  onSelectThinkingLevel: (level: ThinkingLevel) => void;
  onClose: () => void;
  popupRef: React.RefObject<HTMLDivElement | null>;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export const PeriodicTablePopup: React.FC<PeriodicTablePopupProps> = ({
  selectedElementZ,
  selectedOtherModel,
  thinkingLevel,
  onSelectElement,
  onSelectOtherModel,
  onSelectThinkingLevel,
  onClose,
  popupRef,
  anchorRef,
}) => {
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);
  const [inspectedElementZ, setInspectedElementZ] = useState<number>(selectedElementZ ?? 10);
  const [legendFilter, setLegendFilter] = useState<LegendFilter>('all');
  const [mobileTab, setMobileTab] = useState<MobileTab>('table');
  const [mobileGridMode, setMobileGridMode] = useState<'fit' | 'zoom'>('fit');
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopTop, setDesktopTop] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const computePosition = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      if (mobile) {
        setDesktopTop(null);
        return;
      }
      const rect = anchorRef.current?.getBoundingClientRect();
      const estimatedHeight = 576;
      const viewportH = window.innerHeight;
      const padding = 20;

      if (!rect) {
        setDesktopTop(Math.max(padding, (viewportH - estimatedHeight) / 2));
        return;
      }

      const spaceBelow = viewportH - rect.bottom - padding;
      const spaceAbove = rect.top - padding;

      if (spaceBelow >= estimatedHeight) {
        setDesktopTop(rect.bottom + 12);
      } else if (spaceAbove >= estimatedHeight) {
        setDesktopTop(Math.max(padding, rect.top - estimatedHeight - 12));
      } else {
        setDesktopTop(Math.max(padding, (viewportH - estimatedHeight) / 2));
      }
    };

    computePosition();
    window.addEventListener('resize', computePosition);
    return () => window.removeEventListener('resize', computePosition);
  }, [anchorRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !isMobileViewport &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setDesktopSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileViewport]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingZSet = useMemo(() => {
    if (!normalizedQuery) return null;
    const set = new Set<number>();
    for (const el of ELEMENTS) {
      if (
        el.name.toLowerCase().includes(normalizedQuery) ||
        el.symbol.toLowerCase().includes(normalizedQuery) ||
        String(el.z) === normalizedQuery
      ) {
        set.add(el.z);
      }
    }
    return set;
  }, [normalizedQuery]);

  const activePreviewElement = useMemo(() => {
    if (isMobileViewport) {
      return ELEMENTS.find((el) => el.z === inspectedElementZ) ?? ELEMENTS[9];
    }
    if (hoveredElement) return hoveredElement;
    if (matchingZSet && matchingZSet.size === 1) {
      const onlyZ = Array.from(matchingZSet)[0];
      return ELEMENTS.find((el) => el.z === onlyZ) ?? null;
    }
    if (selectedElementZ !== null) {
      return ELEMENTS.find((el) => el.z === selectedElementZ) ?? null;
    }
    return null;
  }, [isMobileViewport, inspectedElementZ, hoveredElement, matchingZSet, selectedElementZ]);

  const filteredUpcomingElements = useMemo(() => {
    const upcoming = ELEMENTS.filter((el) => !el.released);
    if (!normalizedQuery) return upcoming;
    return upcoming.filter((el) => matchingZSet?.has(el.z));
  }, [normalizedQuery, matchingZSet]);

  const filteredReleasedElements = useMemo(() => {
    if (!normalizedQuery) return RELEASED_ELEMENTS;
    return RELEASED_ELEMENTS.filter((el) => matchingZSet?.has(el.z));
  }, [normalizedQuery, matchingZSet]);

  const isCellDimmed = (el: ChemicalElement) => {
    if (matchingZSet && !matchingZSet.has(el.z)) return true;
    if (legendFilter === 'released' && !el.released) return true;
    if (legendFilter === 'upcoming' && el.released) return true;
    return false;
  };

  const handleCellClick = (el: ChemicalElement) => {
    if (isMobileViewport && mobileGridMode === 'fit') {
      if (inspectedElementZ === el.z) {
        onSelectElement(el);
      } else {
        setInspectedElementZ(el.z);
      }
      return;
    }
    onSelectElement(el);
  };

  const previewTheme = activePreviewElement?.released
    ? getReleasedTheme(activePreviewElement.releasedVariant, true)
    : null;

  const cellMode: ElementCellProps['mode'] = !isMobileViewport
    ? 'desktop'
    : mobileGridMode === 'fit'
      ? 'mobile-fit'
      : 'mobile-zoom';

  const renderPeriodicGrid = () => {
    const isFit = cellMode === 'mobile-fit';
    const isZoom = cellMode === 'mobile-zoom';

    return (
      <div
        className={`relative pb-1 ${
          isFit
            ? 'overflow-visible'
            : 'overflow-x-auto -mx-1 px-1 custom-scrollbar touch-pan-x'
        }`}
      >
        <div
          className={
            isFit
              ? 'w-full'
              : isZoom
                ? 'min-w-[920px]'
                : 'min-w-[760px]'
          }
        >
          <div
            className={`grid ${
              isFit
                ? 'gap-[2px] grid-cols-[repeat(18,minmax(0,1fr))]'
                : 'gap-[4px] grid-cols-[20px_repeat(18,minmax(0,1fr))]'
            }`}
          >
            {!isFit && (
              <>
                <div className="col-start-1 row-start-1" aria-hidden="true" />
                {GROUP_NUMBERS.map((g) => (
                  <div
                    key={`group-${g}`}
                    style={{ gridColumn: g + 1, gridRow: 1 }}
                    className="flex items-center justify-center h-[18px] text-[10.5px] text-[#75787b] select-none tabular-nums"
                  >
                    {g}
                  </div>
                ))}
                {PERIOD_NUMBERS.map((p) => (
                  <div
                    key={`period-${p}`}
                    style={{ gridColumn: 1, gridRow: p + 1 }}
                    className="flex items-center justify-center text-[10.5px] text-[#75787b] select-none tabular-nums"
                  >
                    {p}
                  </div>
                ))}
              </>
            )}

            {/* Center Bay: Clean Unboxed Google Typography (Zero nested cards) */}
            {isFit ? (
              <div
                style={{ gridColumn: '3 / 13', gridRow: '1 / 4' }}
                className="flex flex-col items-center justify-center text-center select-none px-1"
              >
                <div className="text-[15px] font-medium text-[#e3e3e3] tracking-[-0.02em] leading-none">
                  Gemini 4
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-2.5 text-[10px] text-[#c4c7c5]">
                  <button
                    type="button"
                    onClick={() =>
                      setLegendFilter((f) => (f === 'released' ? 'all' : 'released'))
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors cursor-pointer ${
                      legendFilter === 'released' ? 'bg-white/[0.1] text-white' : ''
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7fa]" />
                    <span>{RELEASED_COUNT} released</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLegendFilter((f) => (f === 'upcoming' ? 'all' : 'upcoming'))
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors cursor-pointer ${
                      legendFilter === 'upcoming' ? 'bg-white/[0.1] text-white' : ''
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full border border-[#8e918f]" />
                    <span>Soon</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="col-[4/14] row-[2/5] flex flex-col items-center justify-center text-center select-none px-3">
                <div className="text-[26px] md:text-[28px] font-normal text-[#e3e3e3] tracking-[-0.02em] leading-tight">
                  Gemini 4
                </div>

                <div className="mt-1.5 flex items-center justify-center gap-3 text-[12.5px] text-[#c4c7c5]">
                  <button
                    type="button"
                    onClick={() =>
                      setLegendFilter((f) => (f === 'released' ? 'all' : 'released'))
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 transition-colors cursor-pointer ${
                      legendFilter === 'released'
                        ? 'bg-[#004a77] text-[#c2e7ff]'
                        : 'hover:bg-[#e3e3e3]/[0.08]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa]" aria-hidden="true" />
                    <span>{RELEASED_COUNT} released</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLegendFilter((f) => (f === 'upcoming' ? 'all' : 'upcoming'))
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 transition-colors cursor-pointer ${
                      legendFilter === 'upcoming'
                        ? 'bg-[#282a2c] text-[#e3e3e3]'
                        : 'hover:bg-[#e3e3e3]/[0.08]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full border border-[#8e918f]" aria-hidden="true" />
                    <span>Coming soon</span>
                  </button>
                </div>

                {/* Quiet unboxed 1-line typographic inspector */}
                <div className="mt-2 h-5 flex items-center justify-center gap-1.5 text-[12px] text-[#8e918f] tabular-nums">
                  {activePreviewElement && (
                    <>
                      <span className="text-[#c4c7c5] font-medium">
                        {activePreviewElement.z} {activePreviewElement.symbol}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#e3e3e3]">{activePreviewElement.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className={previewTheme ? previewTheme.accentText : 'text-[#8e918f]'}>
                        {activePreviewElement.tagline ?? getElementFamily(activePreviewElement)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Dashed Placeholder Cells */}
            <div
              aria-hidden="true"
              style={{
                gridColumn: isFit ? 3 : 4,
                gridRow: isFit ? 6 : 7,
              }}
              className={`flex items-center justify-center border border-dashed border-white/[0.14] text-[#8e918f] select-none tracking-[-0.02em] tabular-nums ${
                isFit
                  ? 'rounded-[4px] text-[6.5px] aspect-[1/1.08]'
                  : isZoom
                    ? 'rounded-[8px] text-[10px] min-h-[46px]'
                    : 'rounded-[8px] text-[9.5px] aspect-[1/0.86]'
              }`}
            >
              {isFit ? '57-71' : '57–71'}
            </div>
            <div
              aria-hidden="true"
              style={{
                gridColumn: isFit ? 3 : 4,
                gridRow: isFit ? 7 : 8,
              }}
              className={`flex items-center justify-center border border-dashed border-white/[0.14] text-[#8e918f] select-none tracking-[-0.02em] tabular-nums ${
                isFit
                  ? 'rounded-[4px] text-[6.5px] aspect-[1/1.08]'
                  : isZoom
                    ? 'rounded-[8px] text-[10px] min-h-[46px]'
                    : 'rounded-[8px] text-[9.5px] aspect-[1/0.86]'
              }`}
            >
              {isFit ? '89-103' : '89–103'}
            </div>

            {MAIN_ELEMENTS.map((el) => (
              <ElementCell
                key={el.z}
                element={el}
                isSelected={selectedElementZ === el.z}
                isInspected={isMobileViewport && inspectedElementZ === el.z}
                isDimmed={isCellDimmed(el)}
                isHighlighted={Boolean(matchingZSet && matchingZSet.has(el.z))}
                onSelect={handleCellClick}
                onHover={setHoveredElement}
                gridColumn={isFit ? el.group : el.group + 1}
                gridRow={isFit ? el.period : el.period + 1}
                mode={cellMode}
              />
            ))}
          </div>

          {/* Lanthanides & Actinides */}
          <div
            className={`grid ${
              isFit
                ? 'gap-[2px] mt-1.5 grid-cols-[repeat(18,minmax(0,1fr))]'
                : 'gap-[4px] mt-2.5 grid-cols-[20px_repeat(18,minmax(0,1fr))]'
            }`}
          >
            <div
              style={{ gridColumn: isFit ? 2 : 3, gridRow: 1 }}
              className={`flex items-center justify-end text-[#75787b] select-none ${
                isFit ? 'pr-0.5 text-[7.5px]' : 'pr-1.5 text-[10px]'
              }`}
            >
              Ln
            </div>
            {LANTHANIDES.map((el) => (
              <ElementCell
                key={el.z}
                element={el}
                isSelected={selectedElementZ === el.z}
                isInspected={isMobileViewport && inspectedElementZ === el.z}
                isDimmed={isCellDimmed(el)}
                isHighlighted={Boolean(matchingZSet && matchingZSet.has(el.z))}
                onSelect={handleCellClick}
                onHover={setHoveredElement}
                gridColumn={isFit ? el.group : el.group + 1}
                gridRow={1}
                mode={cellMode}
              />
            ))}

            <div
              style={{ gridColumn: isFit ? 2 : 3, gridRow: 2 }}
              className={`flex items-center justify-end text-[#75787b] select-none ${
                isFit ? 'pr-0.5 text-[7.5px]' : 'pr-1.5 text-[10px]'
              }`}
            >
              An
            </div>
            {ACTINIDES.map((el) => (
              <ElementCell
                key={el.z}
                element={el}
                isSelected={selectedElementZ === el.z}
                isInspected={isMobileViewport && inspectedElementZ === el.z}
                isDimmed={isCellDimmed(el)}
                isHighlighted={Boolean(matchingZSet && matchingZSet.has(el.z))}
                onSelect={handleCellClick}
                onHover={setHoveredElement}
                gridColumn={isFit ? el.group : el.group + 1}
                gridRow={2}
                mode={cellMode}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
        className="fixed inset-0 z-40 bg-black/65 md:bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Responsive Dialog (Material 3 Dark Container #1b1c1f) */}
      <motion.div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label="Model periodic table"
        initial={isMobileViewport ? { y: '100%' } : { opacity: 0, y: 10 }}
        animate={isMobileViewport ? { y: 0 } : { opacity: 1, y: 0 }}
        exit={isMobileViewport ? { y: '100%' } : { opacity: 0, y: 8 }}
        transition={{ duration: isMobileViewport ? 0.22 : 0.16, ease: [0.2, 0, 0, 1] }}
        drag={isMobileViewport ? 'y' : false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.35 }}
        onDragEnd={(_, info) => {
          if (isMobileViewport && (info.offset.y > 100 || info.velocity.y > 450)) {
            onClose();
          }
        }}
        style={desktopTop !== null ? { top: `${desktopTop}px` } : undefined}
        className="
          fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] flex flex-col rounded-t-[28px] bg-[#1e1f20] px-4 pt-2 pb-[max(18px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.75)]
          md:inset-x-auto md:bottom-auto md:left-[calc(50%+32px)] md:-translate-x-1/2 md:max-h-[calc(100dvh-28px)] md:w-[min(980px,calc(100vw-92px))] md:rounded-[24px] md:bg-[#1b1c1f] md:border md:border-white/[0.08] md:p-5 md:shadow-[0_20px_60px_rgba(0,0,0,0.75)]
        "
      >
        {/* Material 3 Bottom Sheet Drag Handle */}
        <div
          className="md:hidden flex justify-center py-2 mb-1 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        >
          <div className="w-8 h-1 rounded-full bg-[#8e918f]/50" />
        </div>

        {/* Clean Single Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <SparkleIcon className="w-[20px] h-[20px] shrink-0" />
            <h2 className="text-[17px] md:text-[18px] font-medium text-[#e3e3e3] tracking-[-0.01em] leading-none truncate">
              Model periodic table
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Desktop inline search */}
            <div className="hidden md:flex items-center">
              {desktopSearchOpen ? (
                <div className="flex items-center gap-1.5 h-8 rounded-full bg-[#282a2c] px-3 w-[204px]">
                  <Search className="w-3.5 h-3.5 text-[#c4c7c5] shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && matchingZSet && matchingZSet.size === 1) {
                        const match = ELEMENTS.find((el) => matchingZSet.has(el.z));
                        if (match) onSelectElement(match);
                      }
                    }}
                    placeholder="Filter elements..."
                    aria-label="Filter elements"
                    className="flex-1 min-w-0 bg-transparent text-[12.5px] text-[#e3e3e3] placeholder-[#8e918f] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setDesktopSearchOpen(false);
                    }}
                    aria-label="Clear filter"
                    className="text-[#c4c7c5] hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDesktopSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 0);
                  }}
                  aria-label="Filter elements"
                  title="Filter elements (/)"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
                >
                  <Search className="w-[16px] h-[16px]" />
                </button>
              )}
            </div>

            {/* Mobile Clean 2-Mode Segmented Control: Table | List */}
            <div className="flex md:hidden items-center rounded-full bg-[#282a2c] p-0.5">
              {(['table', 'list'] as const).map((tab) => {
                const active = mobileTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileTab(tab)}
                    className={`px-3 h-7 rounded-full text-[12px] font-medium capitalize transition-colors cursor-pointer ${
                      active ? 'bg-[#004a77] text-[#c2e7ff]' : 'text-[#c4c7c5]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close model periodic table"
              className="flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#e3e3e3]/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa]"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          className="overflow-y-auto flex-1 min-h-0 custom-scrollbar"
          onPointerDownCapture={(e) => {
            if (isMobileViewport) e.stopPropagation();
          }}
        >
          {/* TABLE VIEW (Always shown on desktop; primary view on mobile) */}
          <div className={mobileTab === 'table' ? 'block' : 'hidden md:block'}>
            {renderPeriodicGrid()}

            {/* Mobile Unboxed Hairline-Separated Selected Element Bar (Zero nested card) */}
            {activePreviewElement && (
              <div className="md:hidden mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex flex-col items-center justify-center w-11 h-11 rounded-[10px] border shrink-0 ${
                      previewTheme
                        ? previewTheme.tile
                        : 'bg-[#282a2c] border-white/[0.1] text-[#e3e3e3]'
                    }`}
                  >
                    <span className="text-[9px] leading-none opacity-80 tabular-nums">
                      {activePreviewElement.z}
                    </span>
                    <span className="text-[16px] font-medium leading-tight">
                      {activePreviewElement.symbol}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-medium text-[#e3e3e3] truncate">
                        {activePreviewElement.name}
                      </span>
                      <span className="text-[11px] text-[#8e918f] tabular-nums shrink-0">
                        {activePreviewElement.mass}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#c4c7c5] truncate">
                      {activePreviewElement.released
                        ? activePreviewElement.shortRole
                        : `${getElementFamily(activePreviewElement)} · Coming soon`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileGridMode((m) => (m === 'fit' ? 'zoom' : 'fit'))}
                    aria-label={mobileGridMode === 'fit' ? 'Zoom in table' : 'Fit entire table'}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#282a2c] text-[#c4c7c5] active:bg-[#333537] cursor-pointer"
                  >
                    {mobileGridMode === 'fit' ? (
                      <ZoomIn className="w-4 h-4" />
                    ) : (
                      <ZoomOut className="w-4 h-4" />
                    )}
                  </button>

                  {/* Authentic Google Material 3 Dark Primary Pill CTA (#a8c7fa / #062e6f) */}
                  <button
                    type="button"
                    onClick={() => onSelectElement(activePreviewElement)}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#a8c7fa] active:bg-[#8ab4f8] text-[#062e6f] text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {selectedElementZ === activePreviewElement.z && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedElementZ === activePreviewElement.z ? 'Active' : 'Use'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE LIST VIEW: Clean Google Material Hairline Rows (Zero boxed cards) */}
          {mobileTab === 'list' && (
            <div className="md:hidden flex flex-col">
              <div className="flex items-center gap-2.5 rounded-full bg-[#282a2c] px-4 h-11 mb-3">
                <Search className="w-4 h-4 text-[#c4c7c5] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 118 elements"
                  aria-label="Search elements"
                  className="flex-1 min-w-0 bg-transparent text-[16px] text-[#e3e3e3] placeholder-[#8e918f] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-[#c4c7c5] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="max-h-[44dvh] overflow-y-auto custom-scrollbar divide-y divide-white/[0.06]">
                {filteredReleasedElements.length > 0 && (
                  <div className="pb-2">
                    <div className="px-1 py-1.5 text-[11px] font-medium text-[#8e918f]">
                      Released
                    </div>
                    {filteredReleasedElements.map((el) => {
                      const isSelected = selectedElementZ === el.z;
                      const theme = getReleasedTheme(el.releasedVariant, isSelected);
                      return (
                        <button
                          key={el.z}
                          type="button"
                          onClick={() => onSelectElement(el)}
                          className="flex items-center justify-between gap-3 w-full py-2.5 px-1 min-h-[56px] text-left active:bg-[#e3e3e3]/[0.06] rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex flex-col items-center justify-center w-10 h-10 rounded-[10px] border shrink-0 ${theme.tile}`}
                            >
                              <span className="text-[9px] leading-none opacity-80 tabular-nums">
                                {el.z}
                              </span>
                              <span className="text-[14px] font-medium leading-tight">
                                {el.symbol}
                              </span>
                            </span>
                            <div className="min-w-0">
                              <div className="text-[14px] font-medium text-[#e3e3e3]">
                                Gemini 4 {el.name}
                              </div>
                              <div className="text-[12px] text-[#c4c7c5] truncate">
                                {el.tagline}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredUpcomingElements.length > 0 && (
                  <div className="pt-2">
                    <div className="px-1 py-1.5 text-[11px] font-medium text-[#8e918f]">
                      Coming soon
                    </div>
                    {filteredUpcomingElements.map((el) => {
                      const isSelected = selectedElementZ === el.z;
                      return (
                        <button
                          key={el.z}
                          type="button"
                          onClick={() => onSelectElement(el)}
                          className="flex items-center justify-between gap-3 w-full py-2 px-1 min-h-[52px] text-left active:bg-[#e3e3e3]/[0.06] rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex flex-col items-center justify-center w-9 h-9 rounded-[8px] bg-[#282a2c] text-[#c4c7c5] shrink-0">
                              <span className="text-[8.5px] leading-none text-[#8e918f] tabular-nums">
                                {el.z}
                              </span>
                              <span className="text-[13px] font-medium leading-tight text-[#e3e3e3]">
                                {el.symbol}
                              </span>
                            </span>
                            <div className="min-w-0">
                              <div className="text-[14px] text-[#e3e3e3] truncate">
                                {el.name}
                              </div>
                              <div className="text-[12px] text-[#8e918f] truncate">
                                {getElementFamily(el)} · {el.mass}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredReleasedElements.length === 0 && filteredUpcomingElements.length === 0 && (
                  <div className="py-8 text-center text-[13px] text-[#8e918f]">
                    No elements match “{searchQuery}”.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clean Material 3 Footer: Other models + Thinking level */}
        <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 shrink-0">
          {/* Other models */}
          <div className="flex items-center justify-between md:justify-start gap-2.5">
            <span className="text-[13px] text-[#c4c7c5] select-none shrink-0">
              Other models
            </span>
            <div className="flex items-center gap-2">
              {OTHER_MODELS.map((modelName) => {
                const isActive = selectedOtherModel === modelName;
                return (
                  <button
                    key={modelName}
                    type="button"
                    onClick={() => onSelectOtherModel(modelName)}
                    aria-pressed={isActive}
                    className={`rounded-full min-h-[36px] md:min-h-0 px-3.5 py-1.5 text-[13px] font-medium leading-none whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                      isActive
                        ? 'bg-[#004a77] text-[#c2e7ff]'
                        : 'bg-[#282a2c] hover:bg-[#333537] text-[#e3e3e3]'
                    }`}
                  >
                    {modelName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thinking level (Material 3 Secondary Container segmented bar) */}
          <div
            className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2.5"
            role="group"
            aria-label="Thinking level"
          >
            <span className="text-[13px] text-[#c4c7c5] select-none">
              Thinking level
            </span>
            <div className="grid grid-cols-4 md:inline-flex items-center rounded-full bg-[#282a2c] p-0.5">
              {THINKING_LEVELS.map((level) => {
                const isActive = thinkingLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSelectThinkingLevel(level)}
                    aria-pressed={isActive}
                    className={`rounded-full min-h-[36px] md:min-h-0 px-3 py-1.5 text-[13px] font-medium leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c7fa] ${
                      isActive
                        ? 'bg-[#004a77] text-[#c2e7ff]'
                        : 'text-[#c4c7c5] hover:text-[#e3e3e3]'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
