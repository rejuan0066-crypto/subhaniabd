import PublicLayout from '@/components/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const NoticePage = () => {
  const { language } = useLanguage();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['public-notices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
          <Bell className="w-8 h-8 text-accent" />
          {language === 'bn' ? 'নোটিশ বোর্ড' : 'Notice Board'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>{language === 'bn' ? 'কোনো নোটিশ নেই' : 'No notices available'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div key={n.id} className="card-elevated p-5 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {language === 'bn' ? (n.title_bn || n.title) : n.title}
                    </h3>
                    {(language === 'bn' ? n.content_bn : n.content) && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {language === 'bn' ? n.content_bn : n.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {n.published_at ? format(new Date(n.published_at), 'dd/MM/yyyy') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {n.attachment_url && (
                      <a href={n.attachment_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {n.category || (language === 'bn' ? 'সাধারণ' : 'General')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default NoticePage;
