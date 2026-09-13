import type {
    Aplicacao,
    BarraCategoria,
    Destaque,
    Indicadores,
    ItemCritico,
    LinhaLancamento
} from './tipos.js';

// Tech Forge: este modulo so processa dados, nao busca e nao mexe no DOM

// Logica Avancada: reduce para os grandes numeros (quantidade x valor unitario)
export function calcularTotalAplicado(lista: Aplicacao[]): number {
    return lista.reduce((total: number, item: Aplicacao): number => total + item.quantidade * item.valor_unitario, 0);
}

export function calcularItensLancados(lista: Aplicacao[]): number {
    return lista.reduce((total: number, item: Aplicacao): number => total + item.quantidade, 0);
}

// Logica Avancada: lista vazia devolve 0 em vez de NaN
export function calcularTicketMedio(lista: Aplicacao[]): number {
    if (lista.length === 0) {
        return 0;
    }
    return calcularTotalAplicado(lista) / lista.length;
}

// Logica Avancada: filter para separar os lancamentos de uma categoria
export function filtrarPorCategoria(lista: Aplicacao[], categoria: string): Aplicacao[] {
    if (categoria === '') {
        return lista;
    }
    return lista.filter((item: Aplicacao): boolean => item.categoria === categoria);
}

// Logica Avancada: filter para isolar materiais em estoque critico, sem repetir material
export function filtrarEstoqueCritico(lista: Aplicacao[]): Aplicacao[] {
    return lista.filter((item: Aplicacao, indice: number, todos: Aplicacao[]): boolean =>
        item.situacao_estoque === 'CRITICO'
        && todos.findIndex((outro: Aplicacao): boolean => outro.material === item.material) === indice
    );
}

export function montarIndicadores(lista: Aplicacao[]): Indicadores {
    return {
        totalAplicado: calcularTotalAplicado(lista),
        itensLancados: calcularItensLancados(lista),
        ticketMedio: calcularTicketMedio(lista),
        quantidadeLancamentos: lista.length,
        itensCriticos: filtrarEstoqueCritico(lista).length
    };
}

// Logica Avancada: objeto chave-valor que acumula um numero por nome
export function acumularPorChave(
    lista: Aplicacao[],
    chave: (item: Aplicacao) => string,
    valor: (item: Aplicacao) => number
): Record<string, number> {
    const acumulado: Record<string, number> = {};
    for (const item of lista) {
        const nome = chave(item);
        acumulado[nome] = (acumulado[nome] ?? 0) + valor(item);
    }
    return acumulado;
}

// Logica Avancada: ranking que acha o maior valor do objeto de contagem
export function maiorDestaque(contagem: Record<string, number>): Destaque | null {
    let destaque: Destaque | null = null;
    for (const [nome, valor] of Object.entries(contagem)) {
        if (destaque === null || valor > destaque.valor) {
            destaque = { nome, valor };
        }
    }
    return destaque;
}

export function materialMaisLancado(lista: Aplicacao[]): Destaque | null {
    return maiorDestaque(acumularPorChave(lista, (item: Aplicacao): string => item.material, (): number => 1));
}

export function obraMaiorConsumo(lista: Aplicacao[]): Destaque | null {
    return maiorDestaque(acumularPorChave(
        lista,
        (item: Aplicacao): string => item.obra,
        (item: Aplicacao): number => item.quantidade * item.valor_unitario
    ));
}

export function clienteMaisLancamentos(lista: Aplicacao[]): Destaque | null {
    return maiorDestaque(acumularPorChave(lista, (item: Aplicacao): string => item.cliente, (): number => 1));
}

// Logica Avancada: map transforma o JSON bruto no formato que a tabela exibe (R$ e datas)
export function montarLinhas(lista: Aplicacao[]): LinhaLancamento[] {
    return lista.map((item: Aplicacao): LinhaLancamento => ({
        data: formatarData(item.data_aplicacao),
        material: item.material,
        categoria: item.categoria,
        obra: item.obra,
        cliente: item.cliente,
        quantidade: formatarNumero(item.quantidade, 2),
        unidade: item.unidade,
        total: formatarMoeda(item.quantidade * item.valor_unitario),
        saldo: `${item.estoque_atual} / mín. ${item.estoque_minimo}`,
        situacao: item.situacao_estoque
    }));
}

// Logica Avancada: map gera um array limpo para o grafico de barras
export function montarBarrasCategoria(lista: Aplicacao[]): BarraCategoria[] {
    const totais = acumularPorChave(
        lista,
        (item: Aplicacao): string => item.categoria,
        (item: Aplicacao): number => item.quantidade * item.valor_unitario
    );
    const valores = Object.values(totais);
    const maior = valores.length > 0 ? Math.max(...valores) : 0;

    return Object.entries(totais)
        .sort((a: [string, number], b: [string, number]): number => b[1] - a[1])
        .map(([categoria, total]: [string, number]): BarraCategoria => ({
            categoria,
            valor: formatarMoeda(total),
            percentual: maior > 0 ? Math.round((total / maior) * 100) : 0
        }));
}

export function montarCriticos(lista: Aplicacao[]): ItemCritico[] {
    return filtrarEstoqueCritico(lista).map((item: Aplicacao): ItemCritico => ({
        material: item.material,
        saldo: `${item.estoque_atual} / ${item.estoque_minimo} ${item.unidade}`
    }));
}

export function formatarMoeda(valor: number): string {
    const seguro = Number.isFinite(valor) ? valor : 0;
    return seguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarNumero(valor: number, casas: number = 0): string {
    const seguro = Number.isFinite(valor) ? valor : 0;
    return seguro.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

export function formatarData(iso: string | null): string {
    if (iso === null) {
        return '-';
    }
    const partes = iso.split('-');
    if (partes.length !== 3) {
        return iso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
