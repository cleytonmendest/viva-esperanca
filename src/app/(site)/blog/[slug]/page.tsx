import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { getPostBySlug, getRecentPosts } from '../queries';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Força renderização dinâmica (evita requisições ao Supabase durante build)
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post não encontrado | Igreja Viva Esperança',
    };
  }

  return {
    title: `${post.title} | Blog | Igreja Viva Esperança`,
    description: post.excerpt || `Leia sobre ${post.title} no blog da Igreja Viva Esperança.`,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const recentPosts = await getRecentPosts(3);
  const otherPosts = recentPosts.filter(p => p.slug !== post.slug);

  return (
    <div className="w-full">
      {/* Hero Section with Featured Image */}
      {post.featured_image && (
        <section className="relative w-full h-[400px] mt-16">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        </section>
      )}

      {/* Post Header */}
      <section className={`w-full ${post.featured_image ? 'py-12' : 'py-20 mt-20'} bg-gradient-to-b from-card to-background`}>
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Blog
            </Button>
          </Link>

          <div className="space-y-4">
            {post.post_categories && (
              <Link href={`/blog?category=${post.post_categories.slug}`}>
                <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <Tag className="h-4 w-4" />
                  {post.post_categories.name}
                </span>
              </Link>
            )}

            <h1 className="text-4xl md:text-5xl font-bold">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              {post.members && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Por {post.members.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div
                className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <Separator className="my-8" />

              {/* Share Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Gostou deste post?</h3>
                  <p className="text-sm text-muted-foreground">Compartilhe com seus amigos!</p>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Posts */}
              {otherPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Posts Recentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {otherPosts.map((recentPost) => (
                      <Link
                        key={recentPost.id}
                        href={`/blog/${recentPost.slug}`}
                        className="block group"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {recentPost.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {recentPost.published_at && (
                              <span>{formatDate(recentPost.published_at)}</span>
                            )}
                            {recentPost.post_categories && (
                              <>
                                <span>•</span>
                                <span>{recentPost.post_categories.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {otherPosts.indexOf(recentPost) < otherPosts.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* CTA Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Participe Conosco</CardTitle>
                  <CardDescription>
                    Venha fazer parte da família Viva Esperança!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/contato">Entre em Contato</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Blog CTA */}
      <section className="py-12 bg-card">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Continue Lendo</h2>
          <p className="text-muted-foreground mb-6">
            Explore mais conteúdo edificante em nosso blog
          </p>
          <Button asChild size="lg">
            <Link href="/blog">Ver Todos os Posts</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
