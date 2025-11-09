-- Create post_categories table
CREATE TABLE IF NOT EXISTS public.post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);

-- Enable Row Level Security
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_categories
-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.post_categories
  FOR SELECT
  USING (true);

-- Only admins and pastors can manage categories
CREATE POLICY "Admins and pastors can insert categories"
  ON public.post_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)')
    )
  );

CREATE POLICY "Admins and pastors can update categories"
  ON public.post_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)')
    )
  );

CREATE POLICY "Admins and pastors can delete categories"
  ON public.post_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)')
    )
  );

-- RLS Policies for posts
-- Everyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON public.posts
  FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Authors can view their own drafts
CREATE POLICY "Authors can view their own posts"
  ON public.posts
  FOR SELECT
  USING (
    author_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Admins, pastors and media leaders can create posts
CREATE POLICY "Authorized users can insert posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)', 'lider_midia')
    )
  );

-- Authors can update their own posts, admins can update any
CREATE POLICY "Authors and admins can update posts"
  ON public.posts
  FOR UPDATE
  USING (
    author_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)')
    )
  );

-- Only admins and pastors can delete posts
CREATE POLICY "Admins and pastors can delete posts"
  ON public.posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'pastor(a)')
    )
  );

-- Insert default categories
INSERT INTO public.post_categories (name, slug, description) VALUES
  ('Pregações', 'pregacoes', 'Mensagens e sermões compartilhados nos cultos'),
  ('Eventos', 'eventos', 'Cobertura e informações sobre eventos da igreja'),
  ('Testemunhos', 'testemunhos', 'Histórias de vidas transformadas por Cristo'),
  ('Devocionais', 'devocionais', 'Reflexões e estudos bíblicos'),
  ('Notícias', 'noticias', 'Novidades e comunicados da igreja')
ON CONFLICT (slug) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_categories_updated_at BEFORE UPDATE ON public.post_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample posts (optional, can be removed)
INSERT INTO public.posts (title, slug, content, excerpt, status, published_at) VALUES
  (
    'Bem-vindos ao nosso novo site!',
    'bem-vindos-ao-nosso-novo-site',
    '<p>Estamos muito felizes em apresentar o novo site da Igreja Viva Esperança!</p><p>Aqui você encontrará informações sobre nossos cultos, eventos, ministérios e muito mais.</p><p>Fique à vontade para explorar e conhecer mais sobre nossa igreja.</p>',
    'Conheça o novo site da Igreja Viva Esperança e todas as suas funcionalidades.',
    'published',
    NOW()
  ),
  (
    'Próximo evento: Culto de Ação de Graças',
    'proximo-evento-culto-de-acao-de-gracas',
    '<p>Estamos preparando um culto especial de Ação de Graças!</p><p>Venha celebrar conosco as bênçãos que Deus tem derramado sobre nossas vidas.</p><p>Será um momento de louvor, adoração e gratidão.</p>',
    'Participe do nosso culto especial de Ação de Graças.',
    'published',
    NOW()
  ),
  (
    'Testemunho: Uma vida transformada',
    'testemunho-uma-vida-transformada',
    '<p>Compartilhamos hoje o testemunho de uma vida completamente transformada pelo poder de Deus.</p><p>Uma história de superação, fé e amor que vai tocar seu coração.</p>',
    'Conheça o testemunho emocionante de transformação através de Cristo.',
    'published',
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
