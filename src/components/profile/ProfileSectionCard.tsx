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
    'rounded-[24px] border border-border/30 bg-card/60 backdrop-blur-sm p-5 shadow-sm',
    className
  )}>
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border/30">
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
    </div>
    <div className={cn(
      'grid gap-x-4 gap-y-1',
      columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
    )}>
      {children}
    </div>
  </div>
);

export default ProfileSectionCard;
