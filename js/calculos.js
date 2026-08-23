export function calcularTotalAplicado(lista) {
    return lista.reduce((total, item) => total + item.quantidade * item.valor_unitario, 0);
}
export function calcularItensLancados(lista) {
    return lista.reduce((total, item) => total + item.quantidade, 0);
}
export function calcularTicketMedio(lista) {
    if (lista.length === 0) {
        return 0;
    }
    return calcularTotalAplicado(lista) / lista.length;
}
export function contarItensCriticos(lista) {
    const criticos = new Set();
    for (const item of lista) {
        if (item.situacao_estoque === 'CRITICO') {
            criticos.add(item.material);
        }
    }
    return criticos.size;
}
export function montarIndicadores(lista) {
    return {
        totalAplicado: calcularTotalAplicado(lista),
        itensLancados: calcularItensLancados(lista),
        ticketMedio: calcularTicketMedio(lista),
        quantidadeLancamentos: lista.length,
        itensCriticos: contarItensCriticos(lista)
    };
}
export function formatarMoeda(valor) {
    const seguro = Number.isFinite(valor) ? valor : 0;
    return seguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatarNumero(valor, casas = 0) {
    const seguro = Number.isFinite(valor) ? valor : 0;
    return seguro.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}
export function formatarData(iso) {
    const partes = iso.split('-');
    if (partes.length !== 3) {
        return iso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
//# sourceMappingURL=calculos.js.map