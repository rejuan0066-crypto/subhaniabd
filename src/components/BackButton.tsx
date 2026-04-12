import { forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  position?: 'top' | 'bottom';
}

const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(({ position = 'bottom' }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  if (location.pathname === '/' || location.pathname === '/admin') return null;

  return (
    <div className={position === 'top' ? 'mb-4' : 'mt-8 pb-4'}>
      <button
        ref={ref}
        onClick={() => navigate(-1)}
        className="group inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium
          bg-background/60 backdrop-blur-md
          border border-border/30
          rounded-full shadow-sm
          text-muted-foreground
          hover:bg-background/90 hover:text-emerald-600 hover:shadow-md hover:border-emerald-200/50
          active:scale-[0.97]
          transition-all duration-300 ease-out
          min-h-[44px]"
      >
        <ArrowLeft
          className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
          strokeWidth={1.75}
        />
        {language === 'bn' ? 'পেছনে যান' : 'Go Back'}
      </button>
    </div>
  );
});

BackButton.displayName = 'BackButton';

export default BackButton;
