export const formatDate = (dateString: string) => {
    // Cria o objeto Date tratando o fuso horário para evitar o erro de "um dia a menos"
    const date = new Date(dateString); // TIMESTAMPTZ já vem no formato correto

    // Formata para o padrão brasileiro (dd/mm/aaaa)
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    // Formata para o padrão brasileiro com data e hora (dd/mm/aaaa HH:mm)
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
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

    // Se não corresponder ao padrão, retorna o número como está
    return phoneStr;
};

/**
 * Remove a máscara e retorna apenas os dígitos de um número de telefone.
 * @param maskedPhone Telefone com máscara, ex: "(21) 99999-8888"
 * @returns Apenas os dígitos, ex: "21999998888"
 */
export const unmaskPhoneNumber = (maskedPhone: string | null | undefined): string => {
    if (!maskedPhone) return '';
    return maskedPhone.replace(/\D/g, '');
};

/**
 * Aplica a máscara de telefone dinamicamente enquanto o usuário digita.
 * @param value O valor do input.
 * @returns O valor com a máscara aplicada.
 */
export const applyPhoneMask = (value: string): string => {
    if (!value) return "";
    value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses em volta dos dois primeiros dígitos
    value = value.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen antes dos últimos 4 dígitos
    return value.substring(0, 15); // Limita o tamanho máximo do input
};


/**
 * Valida se um número de telefone tem 11 dígitos (celular).
 * @param phone O número de telefone (com ou sem máscara).
 * @returns `true` se for válido, `false` caso contrário.
 */
export const isPhoneNumberValid = (phone: string): boolean => {
    const cleaned = unmaskPhoneNumber(phone);
    return cleaned.length === 11;
};

