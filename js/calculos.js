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
export function filtrarPorCategoria(lista, categoria) {
    if (categoria === '') {
        return lista;
    }
    return lista.filter((item) => item.categoria === categoria);
}
export function filtrarEstoqueCritico(lista) {
    return lista.filter((item, indice, todos) => item.situacao_estoque === 'CRITICO'
        && todos.findIndex((outro) => outro.material === item.material) === indice);
}
export function montarIndicadores(lista) {
    return {
        totalAplicado: calcularTotalAplicado(lista),
        itensLancados: calcularItensLancados(lista),
        ticketMedio: calcularTicketMedio(lista),
        quantidadeLancamentos: lista.length,
        itensCriticos: filtrarEstoqueCritico(lista).length
    };
}
export function acumularPorChave(lista, chave, valor) {
    const acumulado = {};
    for (const item of lista) {
        const nome = chave(item);
        acumulado[nome] = (acumulado[nome] ?? 0) + valor(item);
    }
    return acumulado;
}
export function maiorDestaque(contagem) {
    let destaque = null;
    for (const [nome, valor] of Object.entries(contagem)) {
        if (destaque === null || valor > destaque.valor) {
            destaque = { nome, valor };
        }
    }
    return destaque;
}
export function materialMaisLancado(lista) {
    return maiorDestaque(acumularPorChave(lista, (item) => item.material, () => 1));
}
export function obraMaiorConsumo(lista) {
    return maiorDestaque(acumularPorChave(lista, (item) => item.obra, (item) => item.quantidade * item.valor_unitario));
}
export function clienteMaisLancamentos(lista) {
    return maiorDestaque(acumularPorChave(lista, (item) => item.cliente, () => 1));
}
export function montarLinhas(lista) {
    return lista.map((item) => ({
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
export function montarBarrasCategoria(lista) {
    const totais = acumularPorChave(lista, (item) => item.categoria, (item) => item.quantidade * item.valor_unitario);
    const valores = Object.values(totais);
    const maior = valores.length > 0 ? Math.max(...valores) : 0;
    return Object.entries(totais)
        .sort((a, b) => b[1] - a[1])
        .map(([categoria, total]) => ({
        categoria,
        valor: formatarMoeda(total),
        percentual: maior > 0 ? Math.round((total / maior) * 100) : 0
    }));
}
export function montarCriticos(lista) {
    return filtrarEstoqueCritico(lista).map((item) => ({
        material: item.material,
        saldo: `${item.estoque_atual} / ${item.estoque_minimo} ${item.unidade}`
    }));
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
    if (iso === null) {
        return '-';
    }
    const partes = iso.split('-');
    if (partes.length !== 3) {
        return iso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
//# sourceMappingURL=calculos.js.map