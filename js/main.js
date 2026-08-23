import { buscarAplicacoes } from './api.js';
import { montarIndicadores, formatarMoeda, formatarNumero, formatarData } from './calculos.js';
const LIMITE_TABELA = 12;
const ROTULO_ESTOQUE = {
    CRITICO: 'Crítico',
    ATENCAO: 'Atenção',
    OK: 'Normal'
};
function rotuloEstoque(situacao) {
    const rotulo = ROTULO_ESTOQUE[situacao];
    return rotulo === undefined ? situacao : rotulo;
}
function elemento(id) {
    return document.getElementById(id);
}
function escrever(id, texto) {
    const alvo = elemento(id);
    if (alvo) {
        alvo.textContent = texto;
    }
}
function exibir(id, visivel) {
    const alvo = elemento(id);
    if (alvo) {
        alvo.classList.toggle('d-none', !visivel);
    }
}
function botaoOcupado(ocupado) {
    const botao = elemento('btn-atualizar');
    if (botao instanceof HTMLButtonElement) {
        botao.disabled = ocupado;
        botao.textContent = ocupado ? 'Lendo...' : 'Atualizar dados';
    }
}
function renderizarIndicadores(ind) {
    escrever('kpi-total', formatarMoeda(ind.totalAplicado));
    escrever('kpi-total-sub', `${ind.quantidadeLancamentos} lançamentos`);
    escrever('kpi-itens', formatarNumero(ind.itensLancados, 1));
    escrever('kpi-itens-sub', 'metros, barras e peças somados');
    escrever('kpi-ticket', formatarMoeda(ind.ticketMedio));
    escrever('kpi-ticket-sub', 'valor aplicado / lançamentos');
    escrever('kpi-criticos', formatarNumero(ind.itensCriticos));
    escrever('kpi-criticos-sub', 'materiais no mínimo ou abaixo');
    const criticos = elemento('kpi-criticos');
    if (criticos) {
        criticos.classList.toggle('dw-total-valor--alerta', ind.itensCriticos > 0);
    }
}
function renderizarPeriodo(lista) {
    const recente = lista[0];
    const antigo = lista[lista.length - 1];
    if (!recente || !antigo) {
        return;
    }
    escrever('carimbo-periodo', `${formatarData(antigo.data_aplicacao)} a ${formatarData(recente.data_aplicacao)}`);
}
function renderizarTabela(lista) {
    const corpo = elemento('corpo-tabela');
    if (!corpo) {
        return;
    }
    corpo.innerHTML = '';
    let contador = 0;
    for (const item of lista) {
        if (contador >= LIMITE_TABELA) {
            break;
        }
        const linha = document.createElement('tr');
        const total = item.quantidade * item.valor_unitario;
        const classeBadge = item.situacao_estoque === 'CRITICO'
            ? 'dw-badge--critico'
            : item.situacao_estoque === 'ATENCAO'
                ? 'dw-badge--atencao'
                : 'dw-badge--ok';
        linha.innerHTML = `
            <td class="col-data">${formatarData(item.data_aplicacao)}</td>
            <td>
                <span class="linha-titulo">${item.material}</span>
                <span class="linha-sub">${item.categoria}</span>
            </td>
            <td>
                <span class="linha-titulo">${item.obra}</span>
                <span class="linha-sub">${item.cliente}</span>
            </td>
            <td class="text-end num">
                ${formatarNumero(item.quantidade, 2)}<span class="linha-unidade">${item.unidade}</span>
            </td>
            <td class="text-end num">${formatarMoeda(total)}</td>
            <td class="text-end col-estoque">
                <span class="linha-saldo num">${item.estoque_atual} / mín. ${item.estoque_minimo}</span>
                <span class="badge dw-badge ${classeBadge}">
                    ${rotuloEstoque(item.situacao_estoque)}
                </span>
            </td>`;
        corpo.appendChild(linha);
        contador++;
    }
    escrever('rodape-tabela', `Exibindo ${contador} de ${lista.length} lançamentos`);
}
async function iniciar(manual) {
    if (manual) {
        botaoOcupado(true);
    }
    else {
        exibir('bloco-carregando', true);
    }
    const resultado = await buscarAplicacoes();
    botaoOcupado(false);
    exibir('bloco-carregando', false);
    exibir('bloco-erro', false);
    exibir('bloco-vazio', false);
    exibir('bloco-conteudo', false);
    if (!resultado.ok) {
        escrever('texto-erro', resultado.erro);
        exibir('bloco-erro', true);
        return;
    }
    if (resultado.dados.length === 0) {
        exibir('bloco-vazio', true);
        return;
    }
    renderizarIndicadores(montarIndicadores(resultado.dados));
    renderizarPeriodo(resultado.dados);
    renderizarTabela(resultado.dados);
    escrever('carimbo-atualizacao', new Date().toLocaleTimeString('pt-BR'));
    exibir('bloco-conteudo', true);
}
document.addEventListener('DOMContentLoaded', () => {
    void iniciar(false);
    const botao = elemento('btn-atualizar');
    if (botao) {
        botao.addEventListener('click', () => {
            void iniciar(true);
        });
    }
});
//# sourceMappingURL=main.js.map