export const formatDate = (dateString:string) => {
    // Cria o objeto Date tratando o fuso horário para evitar o erro de "um dia a menos"
    const date = new Date(dateString + 'T00:00:00');

    // Formata para o padrão brasileiro (dd/mm/aaaa)
    return new Intl.DateTimeFormat('pt-BR').format(date);
};