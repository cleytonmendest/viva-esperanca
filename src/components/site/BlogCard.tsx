import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

type BlogCardProps = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  authorName?: string | null;
  categoryName?: string | null;
  featuredImage?: string | null;
};

export function BlogCard({
  title,
  slug,
  excerpt,
  publishedAt,
  authorName,
  categoryName,
  featuredImage,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block group">
      <Card className="border-2 hover:border-primary transition-all hover:shadow-lg h-full">
        {featuredImage && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
            {categoryName && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{categoryName}</span>
                </div>
              </>
            )}
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {excerpt || 'Leia mais sobre este post...'}
          </CardDescription>
        </CardHeader>
        {authorName && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Por {authorName}</span>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
