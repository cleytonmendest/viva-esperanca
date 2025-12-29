import { createClient } from "@/lib/supabase/server";

/**
 * Verifica se o usuário tem permissões de liderança
 * @param userId ID do usuário autenticado
 * @returns true se o usuário é líder (Admin, Pastor, Líder de Mídia, etc.)
 */
export async function isLeader(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('members')
    .select('roles(is_leadership)')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error checking leadership:', error);
    return false;
  }

  // TypeScript não conhece a estrutura aninhada, então usamos any temporariamente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.roles?.is_leadership || false;
}

/**
 * Busca o perfil completo do usuário com role e setor
 * @param userId ID do usuário autenticado
 * @returns Perfil do membro com role e setor expandidos
 */
export async function getUserRole(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('members')
    .select(`
      id,
      name,
      phone,
      birthdate,
      status,
      user_id,
      roles(id, name, description, is_leadership),
      sectors(id, name, description, icon, color)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data;
}

/**
 * Busca todas as roles disponíveis
 * @returns Array de roles ordenadas por nome
 */
export async function getAllRoles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }

  return data || [];
}

/**
 * Busca todos os setores disponíveis
 * @returns Array de setores ordenados por nome
 */
export async function getAllSectors() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sectors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching sectors:', error);
    return [];
  }

  return data || [];
}

/**
 * Busca uma role específica por ID
 * @param roleId UUID da role
 * @returns Dados da role ou null
 */
export async function getRoleById(roleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error) {
    console.error('Error fetching role:', error);
    return null;
  }

  return data;
}

/**
 * Busca um setor específico por ID
 * @param sectorId UUID do setor
 * @returns Dados do setor ou null
 */
export async function getSectorById(sectorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sectors')
    .select('*')
    .eq('id', sectorId)
    .single();

  if (error) {
    console.error('Error fetching sector:', error);
    return null;
  }

  return data;
}

/**
 * Verifica se uma role específica tem permissões de liderança
 * @param roleId UUID da role
 * @returns true se a role é de liderança
 */
export async function isLeadershipRole(roleId: string): Promise<boolean> {
  const role = await getRoleById(roleId);
  return role?.is_leadership || false;
}
