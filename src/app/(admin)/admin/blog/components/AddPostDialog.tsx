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
import { TablesInsert } from '@/lib/supabase/database.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { addPost } from '../../actions';
import { useAuthStore } from '@/stores/authStore';

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: string;
  status: 'draft' | 'published';
}

interface AddPostDialogProps {
  categories: { id: string; name: string }[];
}

const AddPostDialog = ({ categories }: AddPostDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuthStore();

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

    const postData: TablesInsert<'posts'> = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featured_image: data.featured_image || null,
      category_id: data.category_id,
      author_id: profile?.id || null,
      status: data.status,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    };

    const result = await addPost(postData);

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
        <Button variant="default" className="cursor-pointer">
          Novo Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Post</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo post no blog.
          </DialogDescription>
        </DialogHeader>
        <GenericForm
          formConfig={postFormConfig}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          defaultValues={{ status: 'draft' }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;
