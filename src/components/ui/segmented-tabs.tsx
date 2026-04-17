import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  /** layout: 'pill' (sleek horizontal segmented), 'tile' (responsive grid card-tiles) */
  variant?: 'pill' | 'tile';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Premium Floating Segmented Control with Framer Motion sliding indicator,
 * glassmorphism container, soft hover state, minimalist line icons.
 * Responsive: horizontal scroll on small screens, grid in 'tile' variant.
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
  const layoutId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ensure motion measures DOM
    const t = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const sizeMap = {
    sm: { pad: 'px-3 py-1.5', text: 'text-xs', icon: 'w-3.5 h-3.5', gap: 'gap-1