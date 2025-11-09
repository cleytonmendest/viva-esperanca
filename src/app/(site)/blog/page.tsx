import { BookOpen, Search } from 'lucide-react';
import { BlogCard } from '@/components/site/BlogCard';
import { getPosts, getCategories } from './queries';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Blog | Igreja Viva Esperança',
  description: 'Leia nossos artigos, pregações, testemunhos e notícias da Igreja Viva Esperança.',
};

type PageProps = {
  searchParams: { category?: string };
};

export default async function BlogPage({ searchParams }: PageProps) {
  const posts = await getPosts(searchParams.category);
  const categories = await getCategories();

  const selectedCategory = categories.find(c => c.slug === searchParams.category);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-card to-background py-20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mensagens, testemunhos e reflexões para edificar sua fé
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-card border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/blog">
              <Button
                variant={!searchParams.category ? 'default' : 'outline'}
                size="sm"
              >
                Todos
              </Button>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/blog?category=${category.slug}`}>
                <Button
                  variant={searchParams.category === category.slug ? 'default' : 'outline'}
                  size="sm"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          {selectedCategory && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Categoria: {selectedCategory.name}
              </h2>
              {selectedCategory.description && (
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              )}
            </div>
          )}

          {posts.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedCategory
                    ? `Não há posts na categoria "${selectedCategory.name}" no momento.`
                    : 'Novos posts serão publicados em breve. Volte mais tarde!'}
                </p>
                {selectedCategory && (
                  <Link href="/blog">
                    <Button variant="outline">Ver Todos os Posts</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  publishedAt={post.published_at}
                  authorName={post.members?.name}
                  categoryName={post.post_categories?.name}
                  featuredImage={post.featured_image}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Fique por Dentro</h2>
          <p className="text-lg text-muted-foreground">
            Acompanhe nosso blog para receber conteúdo edificante e se manter atualizado
            sobre as atividades da igreja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contato">Entre em Contato</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
