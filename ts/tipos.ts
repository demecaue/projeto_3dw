// Logica Avancada: contratos que espelham 100% do JSON enviado pelo PHP, sem any

export type SituacaoEstoque = 'CRITICO' | 'ATENCAO' | 'OK';
export type StatusObra = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PARALISADA';

export interface RespostaAPI<T> {
    sucesso: boolean;
    dados: T;
    mensagem: string;
}

export type SemDados = [];

export type Resultado<T> =
    | { ok: true; dados: T; mensagem: string }
    | { ok: false; mensagem: string };

export interface Aplicacao {
    id: number;
    obra: string;
    cliente: string;
    cidade: string;
    status_obra: StatusObra;
    material: string;
    categoria: string;
    unidade: string;
    quantidade: number;
    valor_unitario: number;
    data_aplicacao: string;
    estoque_atual: number;
    estoque_minimo: number;
    situacao_estoque: SituacaoEstoque;
}

export interface PaginaLancamentos {
    itens: Aplicacao[];
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
}

export interface Categoria {
    id: number;
    nome: string;
}

export interface Cliente {
    id: number;
    nome: string;
    cidade: string;
    total_obras: number;
}

export interface Obra {
    id: number;
    titulo: string;
    status: StatusObra;
    data_inicio: string;
    cliente_id: number;
    cliente: string;
    cidade: string;
    total_lancamentos: number;
    materiais_distintos: number;
    total_aplicado: number;
    ultimo_lancamento: string | null;
}

export interface Material {
    id: number;
    nome: string;
    unidade: string;
    valor_unitario: number;
    estoque_atual: number;
    estoque_minimo: number;
    categoria_id: number;
    categoria: string;
    situacao_estoque: SituacaoEstoque;
    total_lancamentos: number;
}

export interface ClienteForm {
    nome: string;
    cidade: string;
}

export interface ObraForm {
    cliente_id: number;
    titulo: string;
    status: StatusObra;
    data_inicio: string;
}

export interface MaterialForm {
    categoria_id: number;
    nome: string;
    unidade: string;
    valor_unitario: number;
    estoque_atual: number;
    estoque_minimo: number;
}

export interface FiltroLancamentos {
    inicio: string;
    fim: string;
    categoria: string;
    busca: string;
    pagina: number;
}

export interface Indicadores {
    totalAplicado: number;
    itensLancados: number;
    ticketMedio: number;
    quantidadeLancamentos: number;
    itensCriticos: number;
}

export interface Destaque {
    nome: string;
    valor: number;
}

export interface LinhaLancamento {
    data: string;
    material: string;
    categoria: string;
    obra: string;
    cliente: string;
    quantidade: string;
    unidade: string;
    total: string;
    saldo: string;
    situacao: SituacaoEstoque;
}

export interface BarraCategoria {
    categoria: string;
    valor: string;
    percentual: number;
}

export interface ItemCritico {
    material: string;
    saldo: string;
}
