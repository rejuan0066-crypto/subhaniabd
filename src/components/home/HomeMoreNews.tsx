import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Props {
  posts: any[];
  language: string;
}

const HomeMoreNews = ({ posts, language }: Props) => {
  const bn = language === 'bn';
  const morePosts = posts.slice(2, 8);

  if (morePosts.length === 0) return null;

  return (
    <section className="py-8 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {bn ? 'আরও সংবাদ' : 'More News'}
          </h2>
          <Link to="/posts" className="text-xs text-primary hover:underline flex items-center gap-1">
            {bn ? 'সব দেখুন' : 'View All'} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {morePosts.map((post: any) => {
            const attachments = (post.attachments as any[]) || [];
            const firstImage = attachments.find((a: any) => a.type?.startsWith('image/'));
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Link to="/posts" className="card-elevated overflow-hidden group block">
                  <div className="aspect-video bg-secondary overflow-hidden">
                    {firstImage ? (
                      <img src={firstImage.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="text-[9px] capitalize mb-2">{post.category}</Badge>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                      {bn ? (post.title_bn || post.title) : post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {bn ? (post.content_bn || post.content) : post.content}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                      <Calendar className="w-3 h-3" />
                      {post.published_at ? format(new Date(post.published_at), 'dd/MM/yyyy') : ''}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeMoreNews;
