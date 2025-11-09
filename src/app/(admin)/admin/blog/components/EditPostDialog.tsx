'use client';
import { FormConfig } from '@/components/forms/form-config';
import { GenericForm } from '@/components/forms/GenericForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TablesUpdate } from '@/lib/supabase/database.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { updatePost } from '../../actions';
import { Pencil } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  category_id: string | null;
  status: string | null;
  published_at: string | null;
}

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: string;
  status: 'draft' | 'published';
}

interface EditPostDialogProps {
  post: Post;
  categories: { id: string; name: string }[];
}

const EditPostDialog = ({ post, categories }: EditPostDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const postFormConfig: FormConfig = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      placeholder: 'Digite o título do post',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      placeholder: 'url-amigavel-do-post',
      required: true,
    },
    {
      name: 'excerpt',
      label: 'Resumo',
      type: 'textarea',
      placeholder: 'Breve resumo do post (aparece nas listagens)',
    },
    {
      name: 'content',
      label: 'Conteúdo',
      type: 'textarea',
      placeholder: 'Conteúdo completo do post (use HTML para formatação)',
      required: true,
    },
    {
      name: 'featured_image',
      label: 'URL da Imagem Destacada',
      type: 'text',
      placeholder: 'https://exemplo.com/imagem.jpg',
    },
    {
      name: 'category_id',
      label: 'Categoria',
      type: 'select',
      placeholder: 'Selecione uma categoria',
      options: categoryOptions,
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'radio',
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'published', label: 'Publicado' },
      ],
      required: true,
    },
  ];

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);

    const postData: TablesUpdate<'posts'> = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featured_image: data.featured_image || null,
      category_id: data.category_id,
      status: data.status,
      // Se está mudando de draft para published, definir published_at
      published_at:
        data.status === 'published' && post.status === 'draft'
          ? new Date().toISOString()
          : undefined,
    };

    const result = await updatePost(post.id, postData);

    if (result.success) {
      toast.success(result.message, { position: 'top-center' });
      setIsOpen(false);
    } else {
      toast.error(result.message, { position: 'top-center' });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="cursor-pointer">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Post</DialogTitle>
          <DialogDescription>
            Atualize as informações do post abaixo.
          </DialogDescription>
        </DialogHeader>
        <GenericForm
          formConfig={postFormConfig}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          defaultValues={{
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || '',
            featured_image: post.featured_image || '',
            category_id: post.category_id || '',
            status: (post.status as 'draft' | 'published') || 'draft',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
