import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  columns?: 2 | 3;
}

const ProfileSectionCard = ({ title, icon: Icon, children, className, columns = 2 }: ProfileSectionCardProps) => (
  <div className={cn(
    'relative rounded-[20px] border border-border/30 bg-card p-6 shadow-sm',
    className
  )}>
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border/20">
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/10 shadow-sm shadow-emerald-500/5">
          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
    </div>
    <div className={cn(
      'grid gap-x-3 gap-y-0.5',
      columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
    )}>
      {children}
    </div>
  </div>
);

export default ProfileSectionCard;
