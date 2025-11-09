// Script para adicionar a permissão do Dashboard Executivo
// Execute com: npx tsx scripts/add-dashboard-permission.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDashboardPermission() {
  console.log('Adicionando permissão do Dashboard Executivo...');

  const { data, error } = await supabase
    .from('page_permissions')
    .upsert({
      page_name: 'Dashboard',
      page_path: '/admin/dashboard',
      icon: 'BarChart3',
      allowed_roles: ['admin', 'pastor(a)', 'lider_midia', 'lider_geral']
    }, {
      onConflict: 'page_path'
    })
    .select();

  if (error) {
    console.error('Erro ao adicionar permissão:', error);
    process.exit(1);
  }

  console.log('✅ Permissão adicionada com sucesso!');
  console.log(data);
  process.exit(0);
}

addDashboardPermission();
