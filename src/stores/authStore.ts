import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase/database.types';

// Define o tipo para os dados do perfil que queremos armazenar.
// Pegamos o tipo 'Row' da nossa tabela 'members' gerada pela CLI.
export type MemberProfile = Tables<'members'>;

// Interface que define a estrutura do nosso store.
// O que ele vai armazenar (estado) e o que ele pode fazer (ações).
interface AuthState {
    user: User | null;
    profile: MemberProfile | null;
    // `isInitialized` nos ajuda a saber se o estado inicial do servidor já foi carregado.
    isInitialized: boolean;
    // Ação para inicializar o store com dados do servidor.
    initialize: (data: { user: User | null; profile: MemberProfile | null }) => void;
    // Ação para limpar o estado no logout.
    reset: () => void;
}

// Criação do store com o hook `create` do Zustand.
export const useAuthStore = create<AuthState>((set) => ({
    // Estado inicial
    user: null,
    profile: null,
    isInitialized: false,

    // Ações que modificam o estado
    initialize: (data) => set({
        user: data.user,
        profile: data.profile,
        isInitialized: true
    }),
    reset: () => set({
        user: null,
        profile: null,
        isInitialized: true // Continua inicializado, mas sem usuário.
    }),
}));
