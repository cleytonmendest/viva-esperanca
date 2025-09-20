export const formatDate = (dateString:string) => {
    // Cria o objeto Date tratando o fuso horário para evitar o erro de "um dia a menos"
    const date = new Date(dateString + 'T00:00:00');

    // Formata para o padrão brasileiro (dd/mm/aaaa)
    return new Intl.DateTimeFormat('pt-BR').format(date);
};


export const formatPhoneNumber = (phoneStr: string | null | undefined): string => {
  // Se o valor for nulo, indefinido ou vazio, retorna uma string vazia
  if (!phoneStr) {
    return '';
  }

  // Remove qualquer caractere que não seja um dígito
  const cleaned = ('' + phoneStr).replace(/\D/g, '');
  
  // Verifica se o número tem o formato de celular com 11 dígitos (DDD + 9)
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);

  if (match) {
    // Retorna a string formatada: (XX) XXXXX-XXXX
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  // Se não corresponder ao padrão, retorna o número limpo ou o original
  return phoneStr;
};