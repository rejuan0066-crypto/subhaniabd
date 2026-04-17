import { useId } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SegmentedTab<T extends string = string> {
  key: T;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface SegmentedTabsProps<T extends string = string> {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
  /** 'pill' = sleek horizontal floating segmented; 'tile' = responsive grid */
  variant?: 'pill' | 'tile';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Premium Floating Segmented Control with Framer Motion sliding indicator,
 * glassmorphism container, soft hover state, minimalist line icons.
 */
export function SegmentedTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  className,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
}: SegmentedTabsProps<T>) {
  const groupId = useId();

  const sizeMap = {
    sm: { pad: 'px-3 py-1.5', text: 'text-xs', icon: 'w-3.5 h-3.5', gap: 'gap-1.5' },
    md: { pad: 'px-4 py-2.5', text: 'text-sm', icon: 'w-4 h-4', gap: 'gap-2' },
    lg: { pad: 'px-5 py-3', text: 'text-sm', icon: 'w-[18px] h-[18px]', gap: 'gap-2.5' },
  } as const;
  const s = sizeMap[size];

  if (variant === 'tile') {
    return (
      <LayoutGroup id={groupId}>
        <div
          className={cn(
            'grid gap-2 p-2 rounded-3xl border border-border/40',
            'bg-gradient-to-br from-background/70 via-background/40 to-background/70',
            'backdrop-blur-xl shadow-[0_4px_24px_-8px_hsl(var(--foreground)/0.08)]',
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-' + Math.min(tabs.length, 6),
            className,
          )}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = value === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={cn(
                  'relative flex items-center justify-center font-semibold transition-colors duration-200 rounded-2xl',
                  s.pad, s.text, s.gap,
                  active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`seg-bg-${groupId}`}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/85 shadow-[0_6px_20px_-4px_hsl(var(--primary)/0.45)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  {Icon && <Icon className={cn(s.icon, 'shrink-0')} strokeWidth={1.75} />}
                  <span>{tab.label}</span>
                  {tab.badge != null && (
                    <span className={cn(
                      'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                      active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}>{tab.badge}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    );
  }

  // 'pill' variant — floating segmented control with sliding background
  return (
    <LayoutGroup id={groupId}>
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1.5 rounded-full',
          'border border-border/30',
          'bg-gradient-to-r from-muted/70 via-muted/40 to-muted/70',
          'backdrop-blur-xl shadow-[inset_0_1px_0_hsl(var(--background)/0.4),0_2px_12px_-4px_hsl(var(--foreground)/0.08)]',
          'overflow-x-auto scrollbar-hide max-w-full',
          fullWidth && 'w-full',
          className,
        )}
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={cn(
                'relative flex items-center justify-center font-semibold transition-colors duration-200 rounded-full whitespace-nowrap',
                s.pad, s.text, s.gap,
                fullWidth && 'flex-1',
                active
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`seg-bg-${groupId}`}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/85 shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.4)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className={cn(s.icon, 'shrink-0')} strokeWidth={1.75} />}
                <span>{tab.label}</span>
                {tab.badge != null && (
                  <span className={cn(
                    'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-foreground/10 text-foreground/70',
                  )}>{tab.badge}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default SegmentedTabs;
