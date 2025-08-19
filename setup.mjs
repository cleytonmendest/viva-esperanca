// setup.js
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

// Definição de cores para uma saída mais legível no terminal
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m'; // Sem Cor

// -------- FUNÇÃO CORRIGIDA --------
// Agora ela lida com 1 ou 2 argumentos de forma inteligente.
function log(colorOrMessage, message) {
  if (message === undefined) {
    // Caso de uso: log('Mensagem simples sem cor')
    console.log(colorOrMessage);
  } else {
    // Caso de uso: log(YELLOW, 'Mensagem colorida')
    const color = colorOrMessage;
    console.log(`${color}${message}${NC}`);
  }
}

/**
 * Atualiza o arquivo hosts do sistema operacional para mapear os domínios de desenvolvimento.
 * Requer privilégios de administrador para ser executado.
 */
function updateHostsFile() {
  log(YELLOW, '\nVerificando o arquivo hosts...');
  const hostsEntry = '\n# Mapeamento para o projeto Viva Esperança\n127.0.0.1       viva-esperanca.local admin.viva-esperanca.local\n';
  
  const hostsPath = os.platform() === 'win32' 
    ? path.join('C:', 'Windows', 'System32', 'drivers', 'etc', 'hosts') 
    : '/etc/hosts';

  try {
    const hostsContent = fs.readFileSync(hostsPath, 'utf8');
    if (hostsContent.includes('viva-esperanca.local')) {
      log(GREEN, '-> Entradas de domínio local já existem. Pulando.');
      return;
    }
    
    log(YELLOW, `-> Adicionando domínios em ${hostsPath}.`);
    fs.appendFileSync(hostsPath, hostsEntry);
    log(GREEN, '-> Domínios adicionados com sucesso!');

  } catch (error) {
    log(RED, `\nERRO: Falha ao atualizar o arquivo hosts.`);
    log(YELLOW, `Por favor, rode este script com privilégios de administrador.`);
    log(YELLOW, `Ex: 'sudo npm run setup' (macOS/Linux) ou em um terminal de Administrador (Windows).`);
    process.exit(1);
  }
}

/**
 * Cria o arquivo .env.local a partir do .env.example, se ele ainda não existir.
 */
function createEnvFile() {
  log(YELLOW, '\nVerificando o arquivo de ambiente...');
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (fs.existsSync(envPath)) {
    log(GREEN, '-> O arquivo .env.local já existe. Pulando.');
    return;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    log(RED, 'ERRO: Arquivo .env.example não encontrado! Crie um para continuar.');
    process.exit(1);
  }

  log(YELLOW, '-> Criando o arquivo .env.local a partir do exemplo.');
  fs.copyFileSync(envExamplePath, envPath);
  log(GREEN, '-> .env.local criado! Lembre-se de preencher suas chaves do Supabase.');
}

/**
 * Roda 'npm install' para instalar todas as dependências do projeto.
 */
function installDependencies() {
  log(YELLOW, '\nInstalando dependências do projeto (npm install)...');
  try {
    // 'stdio: inherit' mostra a saída do comando no terminal
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    log(RED, 'ERRO: Falha ao rodar "npm install". Verifique seu ambiente Node.js.');
    process.exit(1);
  }
}

/**
 * Função principal que orquestra todo o processo de setup.
 */
function main() {
  log(GREEN, '--- Iniciando configuração do ambiente de desenvolvimento ---');
  
  updateHostsFile();
  createEnvFile();
  installDependencies();
  
  log(GREEN, '\n--- ✅ Configuração concluída! ---');
  log('Para iniciar o servidor de desenvolvimento, rode o comando:');
  log(YELLOW, 'npm run dev');
  log('\nO projeto estará acessível em:');
  log(`-> Site Principal: ${GREEN}http://viva-esperanca.local:3000${NC}`);
  log(`-> Painel Admin:   ${GREEN}http://admin.viva-esperanca.local:3000${NC}`);
}

main();