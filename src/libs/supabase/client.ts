import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '../database.types' // Se você tiver os tipos do seu DB

export const createClient = () => createPagesBrowserClient()