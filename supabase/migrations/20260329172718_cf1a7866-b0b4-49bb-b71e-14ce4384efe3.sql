
-- Post comments table
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  commenter_name text NOT NULL,
  comment_text text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments" ON public.post_comments
  FOR SELECT TO public USING (is_approved = true);

CREATE POLICY "Anyone can insert comments" ON public.post_comments
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage comments" ON public.post_comments
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Post likes table
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, visitor_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert likes" ON public.post_likes
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can delete own likes" ON public.post_likes
  FOR DELETE TO public USING (true);

CREATE POLICY "Admins can manage likes" ON public.post_likes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
