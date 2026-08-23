export interface Aplicacao {
    id: number;
    obra: string;
    cliente: string;
    cidade: string;
    status_obra: string;
    material: string;
    categoria: string;
    unidade: string;
    quantidade: number;
    valor_unitario: number;
    data_aplicacao: string;
    estoque_atual: number;
    estoque_minimo: number;
    situacao_estoque: string;
}

export interface RespostaAPI<T> {
    sucesso: boolean;
    dados: T;
    mensagem: string;
}

export interface Indicadores {
    totalAplicado: number;
    itensLancados: number;
    ticketMedio: number;
    quantidadeLancamentos: number;
    itensCriticos: number;
}
