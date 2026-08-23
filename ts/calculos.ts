import type { Aplicacao, Indicadores } from './tipos.js';

export function calcularTotalAplicado(lista: Aplicacao[]): number {
    return lista.reduce((total, item) => total + item.quantidade * item.valor_unitario, 0);
}

export function calcularItensLancados(lista: Aplicacao[]): number {
    return lista.reduce((total, item) => total + item.quantidade, 0);
}

export function calcularTicketMedio(lista: Aplicacao[]): number {
    if (lista.length === 0) {
        return 0;
    }
    return calcularTotalAplicado(lista) / lista.length;
}

export function contarItensCriticos(lista: Aplicacao[]): number {
    const criticos = new Set<string>();
    for (const item of lista) {
        if (item.situacao_estoque === 'CRITICO') {
            criticos.add(item.material);
        }
    }
    return criticos.size;
}

export function montarIndicadores(lista: Aplicacao[]): Indicadores {
    return {
        totalAplicado: calcularTotalAplicado(lista),
        itensLancados: calcularItensLancados(lista),
        ticketMedio: calcularTicketMedio(lista),
        quantidadeLancamentos: lista.length,
        itensCriticos: contarItensCriticos(lista)
    };
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

export function formatarData(iso: string): string {
    const partes = iso.split('-');
    if (partes.length !== 3) {
        return iso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
