'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

// =====================================================
// ROLES CRUD
// =====================================================

export async function createRole(roleData: TablesInsert<'roles'>) {
  const supabase = await createClient();

  // Verificar se já existe role com esse nome
  const { data: existing } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleData.name)
    .single();

  if (existing) {
    return {
      success: false,
      message: 'Já existe uma role com este nome',
    };
  }

  const { error } = await supabase
    .from('roles')
    .insert([roleData]);

  if (error) {
    console.error('Error creating role:', error);
    return {
      success: false,
      message: 'Erro ao criar role',
    };
  }

  revalidatePath('/admin/configuracoes');
  return {
    success: true,
    message: 'Role criada com sucesso!',
  };
}

export async function updateRole(roleId: string, roleData: TablesUpdate<'roles'>) {
  const supabase = await createClient();

  // Verificar se já existe outra role com esse nome
  if (roleData.name) {
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleData.name)
      .neq('id', roleId)
      .single();

    if (existing) {
      return {
        success: false,
        message: 'Já existe uma role com este nome',
      };
    }
  }

  const { error } = await supabase
    .from('roles')
    .update(roleData)
    .eq('id', roleId);

  if (error) {
    console.error('Error updating role:', error);
    return {
      success: false,
      message: 'Erro ao atualizar role',
    };
  }

  revalidatePath('/admin/configuracoes');
  revalidatePath('/admin');
  return {
    success: true,
    message: 'Role atualizada com sucesso!',
  };
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient();

  // Verificar se a role está em uso
  const { data: membersUsingRole, error: checkError } = await supabase
    .from('members')
    .select('id')
    .eq('role_id', roleId)
    .limit(1);

  if (checkError) {
    console.error('Error checking role usage:', checkError);
    return {
      success: false,
      message: 'Erro ao verificar uso da role',
    };
  }

  if (membersUsingRole && membersUsingRole.length > 0) {
    return {
      success: false,
      message: 'Não é possível deletar uma role que está em uso por membros',
    };
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    console.error('Error deleting role:', error);
    return {
      success: false,
      message: 'Erro ao deletar role',
    };
  }

  revalidatePath('/admin/configuracoes');
  return {
    success: true,
    message: 'Role deletada com sucesso!',
  };
}

// =====================================================
// SECTORS CRUD
// =====================================================

export async function createSector(sectorData: TablesInsert<'sectors'>) {
  const supabase = await createClient();

  // Verificar se já existe setor com esse nome
  const { data: existing } = await supabase
    .from('sectors')
    .select('id')
    .eq('name', sectorData.name)
    .single();

  if (existing) {
    return {
      success: false,
      message: 'Já existe um setor com este nome',
    };
  }

  const { error } = await supabase
    .from('sectors')
    .insert([sectorData]);

  if (error) {
    console.error('Error creating sector:', error);
    return {
      success: false,
      message: 'Erro ao criar setor',
    };
  }

  revalidatePath('/admin/configuracoes');
  return {
    success: true,
    message: 'Setor criado com sucesso!',
  };
}

export async function updateSector(sectorId: string, sectorData: TablesUpdate<'sectors'>) {
  const supabase = await createClient();

  // Verificar se já existe outro setor com esse nome
  if (sectorData.name) {
    const { data: existing } = await supabase
      .from('sectors')
      .select('id')
      .eq('name', sectorData.name)
      .neq('id', sectorId)
      .single();

    if (existing) {
      return {
        success: false,
        message: 'Já existe um setor com este nome',
      };
    }
  }

  const { error } = await supabase
    .from('sectors')
    .update(sectorData)
    .eq('id', sectorId);

  if (error) {
    console.error('Error updating sector:', error);
    return {
      success: false,
      message: 'Erro ao atualizar setor',
    };
  }

  revalidatePath('/admin/configuracoes');
  revalidatePath('/admin');
  return {
    success: true,
    message: 'Setor atualizado com sucesso!',
  };
}

export async function deleteSector(sectorId: string) {
  const supabase = await createClient();

  // Verificar se o setor está em uso
  const { data: membersUsingSector, error: checkError } = await supabase
    .from('members')
    .select('id')
    .eq('sector_id', sectorId)
    .limit(1);

  if (checkError) {
    console.error('Error checking sector usage:', checkError);
    return {
      success: false,
      message: 'Erro ao verificar uso do setor',
    };
  }

  if (membersUsingSector && membersUsingSector.length > 0) {
    return {
      success: false,
      message: 'Não é possível deletar um setor que está em uso por membros',
    };
  }

  const { error } = await supabase
    .from('sectors')
    .delete()
    .eq('id', sectorId);

  if (error) {
    console.error('Error deleting sector:', error);
    return {
      success: false,
      message: 'Erro ao deletar setor',
    };
  }

  revalidatePath('/admin/configuracoes');
  return {
    success: true,
    message: 'Setor deletado com sucesso!',
  };
}
