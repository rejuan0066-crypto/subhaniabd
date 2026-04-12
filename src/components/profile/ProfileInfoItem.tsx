import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileInfoItemProps {
  icon?: LucideIcon;
  label: string;
  value: string | number | null | undefined;
  className?: string;
  fullWidth?: boolean;
}

const ProfileInfoItem = ({ icon: Icon, label, value, className, fullWidth }: ProfileInfoItemProps) => {
  const displayValue = value == null || value === '' || value === '-' ? '-' : value;
  const isEmpty = displayValue === '-';

  return (
    <div className={cn('flex items-start gap-3 py-2', fullWidth && 'col-span-full', className)}>
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/8">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
        <p className={cn('text-sm font-semibold mt-0.5 break-words', isEmpty ? 'text-muted-foreground/40' : 'text-foreground')}>
          {displayValue}
        </p>
      </div>
    </div>
  );
};

export default ProfileInfoItem;
