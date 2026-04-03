import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  // Hide on home and root admin dashboard
  if (location.pathname === '/' || location.pathname === '/admin') return null;

  return (
    <div className="mt-8 pb-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'bn' ? 'পেছনে যান' : 'Go Back'}
      </button>
    </div>
  );
};

export default BackButton;
