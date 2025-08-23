import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
// import type { Database } from '../database.types' // Se você tiver os tipos do seu DB

export const createClient = () =>
    createServerComponentClient({
        cookies: cookies,
    })