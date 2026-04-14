import { useBijoy } from '@/contexts/BijoyContext';
import { Keyboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const BijoyToggle = () => {
  const { bijoyEnabled, toggleBijoy } = useBijoy();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleBijoy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            bijoyEnabled
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">
            {bijoyEnabled ? 'বিজয়' : 'EN'}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{bijoyEnabled ? 'বিজয় কীবোর্ড চালু আছে (ক্লিক করে বন্ধ করুন)' : 'বিজয় কীবোর্ড চালু করুন'}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default BijoyToggle;
