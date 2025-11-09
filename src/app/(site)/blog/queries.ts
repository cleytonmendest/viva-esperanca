import { createClient } from '@/lib/supabase/server';

export async function getPosts(categorySlug?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      post_categories (
        name,
        slug
      ),
      members (
        name
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Filter by category if provided
  if (categorySlug) {
    const { data: category } = await supabase
      .from('post_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      post_categories (
        name,
        slug
      ),
      members (
        name
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('post_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getRecentPosts(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      post_categories (
        name
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }

  return data || [];
}
