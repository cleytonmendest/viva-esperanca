import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddPostDialog from './components/AddPostDialog';
import EditPostDialog from './components/EditPostDialog';
import DeletePostDialog from './components/DeletePostDialog';
import { getAllPosts, getAllCategories } from '../queries';
import { formatDateTime } from '@/lib/format';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const BlogPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  const posts = await getAllPosts();
  const categories = await getAllCategories();

  return (
    <>
      <section className="lg:max-w-6xl my-4 mx-auto w-full px-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os posts do blog da igreja
        </p>
      </section>
      <section className="lg:max-w-6xl mx-auto w-full px-4">
        <div className="flex justify-end mb-4">
          <AddPostDialog categories={categories} />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      {post.post_categories?.name || 'Sem categoria'}
                    </TableCell>
                    <TableCell>
                      {post.members?.name || 'Autor desconhecido'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {post.created_at ? formatDateTime(post.created_at) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditPostDialog post={post} categories={categories} />
                        <DeletePostDialog postId={post.id} postTitle={post.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum post encontrado. Clique em &quot;Novo Post&quot; para criar o primeiro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
