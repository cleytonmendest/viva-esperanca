"use client";

import { useRef } from 'react';
import { useAuthStore, MemberProfile } from '@/stores/authStore';
import type { User } from '@supabase/supabase-js';

interface StoreInitializerProps {
    user: User | null;
    profile: MemberProfile | null;
}

// Este componente tem uma única responsabilidade:
// Pegar os dados do Server Component e colocar no store do Zustand.
// Ele só faz isso UMA VEZ, na primeira renderização.
function StoreInitializer({ user, profile }: StoreInitializerProps) {
    const initialized = useRef(false);

    // Se o store ainda não foi inicializado, fazemos isso agora.
    if (!initialized.current) {
        useAuthStore.getState().initialize({ user, profile });
        initialized.current = true;
    }

    // Este componente não renderiza nada na tela. É apenas para lógica.
    return null;
}

export default StoreInitializer;
