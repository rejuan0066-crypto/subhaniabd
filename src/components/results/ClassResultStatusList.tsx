import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Eye, PenLine, ChevronDown, ChevronRight } from 'lucide-react';

interface ClassResultStatusListProps {
  classes: any[];
  resultStatusMap: Record<string, boolean>;
  onClassClick: (classId: string) => void;
  examSessionName: string;
}

const ClassResultStatusList = ({
  classes,
  resultStatusMap,
  onClassClick,
  examSessionName,
}: ClassResultStatusListProps) => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [isOpen, setIsOpen] = useState(false);

  if (!classes.length) {
    return (
      <div className="card-elevated rounded-xl p-8 text-center text-muted-foreground">
        {bn ? 'এই সেশনে কোনো ক্লাস নেই' : 'No classes in this session'}
      </div>
    );
  }

  const savedCount = classes.filter(c => resultStatusMap[c.id]).length;

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {examSessionName} — {bn ? 'ক্লাস ভিত্তিক ফলাফল স্ট্যাটাস' : 'Class-wise Result Status'}
        </h3>
        <Badge variant="outline" className="text-xs">
          {savedCount}/{classes.length} {bn ? 'সম্পন্ন' : 'done'}
        </Badge>
      </button>
      {isOpen && <div className="divide-y divide-border">
        {classes.map((cls: any) => {
          const hasResults = resultStatusMap[cls.id] || false;
          return (
            <div
              key={cls.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">
                  {bn ? cls.name_bn : cls.name}
                </span>
                {hasResults ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {bn ? 'সংরক্ষিত' : 'Saved'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                    <Clock className="w-3 h-3" />
                    {bn ? 'অপেক্ষমান' : 'Pending'}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant={hasResults ? 'outline' : 'default'}
                className="gap-1.5"
                onClick={() => onClassClick(cls.id)}
              >
                {hasResults ? <Eye className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
                {hasResults ? (bn ? 'দেখুন' : 'View') : (bn ? 'এন্ট্রি' : 'Entry')}
              </Button>
            </div>
          );
        })}
      </div>}
    </div>
  );
};

export default ClassResultStatusList;
