import type {
    Aplicacao,
    BarraCategoria,
    Categoria,
    Destaque,
    FiltroLancamentos,
    Indicadores,
    ItemCritico,
    LinhaLancamento,
    PaginaLancamentos
} from './tipos.js';
import { buscarAplicacoes, buscarCategorias, buscarPaginaLancamentos } from './api.js';
import {
    clienteMaisLancamentos,
    filtrarPorCategoria,
    formatarData,
    formatarMoeda,
    formatarNumero,
    materialMaisLancado,
    montarBarrasCategoria,
    montarCriticos,
    montarIndicadores,
    montarLinhas,
    obraMaiorConsumo
} from './calculos.js';
import {
    carimbarLeitura,
    celula,
    criar,
    elemento,
    escrever,
    exibir,
    linhaMensagem,
    preencherCampo,
    preencherSelect,
    valorCampo
} from './dom.js';
import { badgeEstoque } from './crud.js';

// Tech Forge: arquivo da pagina so liga eventos, chama a busca (api.ts) e depois renderiza

const filtro: FiltroLancamentos = { inicio: '', fim: '', categoria: '', busca: '', pagina: 1 };
let aplicacoes: Aplicacao[] = [];

function botaoOcupado(ocupado: boolean): void {
    const botao = elemento('btn-atualizar');
    if (botao instanceof HTMLButtonElement) {
        botao.disabled = ocupado;
        botao.textContent = ocupado ? 'Lendo...' : 'Atualizar dados';
    }
}

function renderizarIndicadores(ind: Indicadores): void {
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

function escreverDestaque(id: string, destaque: Destaque | null, detalhe: (valor: number) => string): void {
    if (destaque === null) {
        escrever(id, 'Nenhum dado registrado');
        escrever(`${id}-sub`, '-');
        return;
    }
    escrever(id, destaque.nome);
    escrever(`${id}-sub`, detalhe(destaque.valor));
}

// Logica Avancada: destaques calculados com o ranking do calculos.ts
function renderizarDestaques(lista: Aplicacao[]): void {
    escreverDestaque('destaque-material', materialMaisLancado(lista),
        (valor: number): string => `${valor} lançamentos`);
    escreverDestaque('destaque-obra', obraMaiorConsumo(lista),
        (valor: number): string => `${formatarMoeda(valor)} aplicados`);
    escreverDestaque('destaque-cliente', clienteMaisLancamentos(lista),
        (valor: number): string => `${valor} lançamentos`);
}

function renderizarBarras(barras: BarraCategoria[]): void {
    const lista = elemento('lista-categorias');
    if (!lista) {
        return;
    }
    lista.replaceChildren();

    for (const barra of barras) {
        const trilho = criar('span', 'dw-barra-trilho');
        const preenchido = criar('span', 'dw-barra-valor');
        preenchido.style.width = `${barra.percentual}%`;
        trilho.appendChild(preenchido);

        const item = criar('li', 'dw-barra');
        item.append(
            criar('span', 'dw-barra-nome', barra.categoria),
            criar('span', 'dw-barra-numero', barra.valor),
            trilho
        );
        lista.appendChild(item);
    }
}

function renderizarCriticos(itens: ItemCritico[]): void {
    const lista = elemento('lista-criticos');
    if (!lista) {
        return;
    }
    lista.replaceChildren();

    if (itens.length === 0) {
        lista.appendChild(criar('li', 'dw-lista-vazia', 'Nenhum material em estoque crítico.'));
        return;
    }

    for (const critico of itens) {
        const item = criar('li');
        item.append(criar('span', '', critico.material), criar('span', 'num', critico.saldo));
        lista.appendChild(item);
    }
}

function renderizarPeriodo(lista: Aplicacao[]): void {
    const recente = lista[0];
    const antigo = lista[lista.length - 1];
    if (!recente || !antigo) {
        escrever('carimbo-periodo', '-');
        return;
    }
    escrever('carimbo-periodo', `${formatarData(antigo.data_aplicacao)} a ${formatarData(recente.data_aplicacao)}`);
}

// Tech Forge: renderizacao separada da busca, recebe a lista pronta
function renderizarPainel(): void {
    const lista = filtrarPorCategoria(aplicacoes, filtro.categoria);

    renderizarPeriodo(lista);

    if (lista.length === 0) {
        exibir('bloco-conteudo', false);
        exibir('bloco-vazio', true);
        return;
    }

    renderizarIndicadores(montarIndicadores(lista));
    renderizarDestaques(lista);
    renderizarBarras(montarBarrasCategoria(lista));
    renderizarCriticos(montarCriticos(lista));

    exibir('bloco-vazio', false);
    exibir('bloco-conteudo', true);
}

function renderizarLinhas(linhas: LinhaLancamento[]): void {
    const corpo = elemento('corpo-tabela');
    if (!corpo) {
        return;
    }
    corpo.replaceChildren();

    if (linhas.length === 0) {
        corpo.appendChild(linhaMensagem(6, 'Nenhum lançamento encontrado.'));
        return;
    }

    for (const item of linhas) {
        const linha = criar('tr');
        linha.append(
            celula('col-data', item.data),
            celula('', criar('span', 'linha-titulo', item.material), criar('span', 'linha-sub', item.categoria)),
            celula('', criar('span', 'linha-titulo', item.obra), criar('span', 'linha-sub', item.cliente)),
            celula('text-end num', item.quantidade, criar('span', 'linha-unidade', item.unidade)),
            celula('text-end num', item.total),
            celula('text-end col-estoque', criar('span', 'linha-saldo num', item.saldo), badgeEstoque(item.situacao))
        );
        corpo.appendChild(linha);
    }
}

function botaoPagina(texto: string, pagina: number, ativo: boolean, desativado: boolean): HTMLLIElement {
    const item = criar('li', 'page-item');
    item.classList.toggle('active', ativo);
    item.classList.toggle('disabled', desativado);

    const botao = criar('button', 'page-link', texto);
    botao.type = 'button';
    botao.disabled = desativado;
    botao.addEventListener('click', (): void => {
        filtro.pagina = pagina;
        void carregarTabela();
    });

    item.appendChild(botao);
    return item;
}

function renderizarPaginacao(pagina: PaginaLancamentos): void {
    const lista = elemento('paginacao');
    if (!lista) {
        return;
    }
    lista.replaceChildren();

    if (pagina.total_paginas <= 1) {
        return;
    }

    lista.appendChild(botaoPagina('Anterior', pagina.pagina - 1, false, pagina.pagina <= 1));

    const inicio = Math.max(1, pagina.pagina - 2);
    const fim = Math.min(pagina.total_paginas, inicio + 4);
    for (let numero = inicio; numero <= fim; numero++) {
        lista.appendChild(botaoPagina(String(numero), numero, numero === pagina.pagina, false));
    }

    lista.appendChild(botaoPagina('Próxima', pagina.pagina + 1, false, pagina.pagina >= pagina.total_paginas));
}

async function carregarTabela(): Promise<void> {
    const resultado = await buscarPaginaLancamentos(filtro);

    if (!resultado.ok) {
        renderizarLinhas([]);
        renderizarPaginacao({ itens: [], total: 0, pagina: 1, por_pagina: 0, total_paginas: 0 });
        escrever('rodape-tabela', resultado.mensagem);
        return;
    }

    const pagina = resultado.dados;
    renderizarLinhas(montarLinhas(pagina.itens));
    renderizarPaginacao(pagina);

    const texto = pagina.total === 0
        ? 'Nenhum lançamento para exibir'
        : `Página ${pagina.pagina} de ${pagina.total_paginas} - ${pagina.total} lançamentos`;
    escrever('rodape-tabela', texto);
}

async function carregarPainel(manual: boolean): Promise<void> {
    if (manual) {
        botaoOcupado(true);
    } else {
        exibir('bloco-carregando', true);
    }

    const resultado = await buscarAplicacoes(filtro.inicio, filtro.fim);

    botaoOcupado(false);
    exibir('bloco-carregando', false);
    exibir('bloco-erro', false);

    if (!resultado.ok) {
        aplicacoes = [];
        escrever('texto-erro', resultado.mensagem);
        exibir('bloco-vazio', false);
        exibir('bloco-conteudo', false);
        exibir('bloco-erro', true);
        return;
    }

    aplicacoes = resultado.dados;
    renderizarPainel();
    carimbarLeitura();
}

async function carregarCategorias(): Promise<void> {
    const resultado = await buscarCategorias();
    if (resultado.ok) {
        preencherSelect('filtro-categoria', resultado.dados.map((categoria: Categoria): { valor: string; texto: string } => ({
            valor: categoria.nome,
            texto: categoria.nome
        })));
    }
}

function aplicarFiltros(): void {
    const periodoMudou = filtro.inicio !== valorCampo('filtro-inicio') || filtro.fim !== valorCampo('filtro-fim');

    filtro.inicio = valorCampo('filtro-inicio');
    filtro.fim = valorCampo('filtro-fim');
    filtro.categoria = valorCampo('filtro-categoria');
    filtro.pagina = 1;

    // periodo vai para a procedure; categoria so refiltra o array que ja esta na memoria
    if (periodoMudou) {
        void carregarPainel(false);
    } else {
        renderizarPainel();
    }
    void carregarTabela();
}

function limparFiltros(): void {
    preencherCampo('filtro-inicio', '');
    preencherCampo('filtro-fim', '');
    preencherCampo('filtro-categoria', '');
    aplicarFiltros();
}

document.addEventListener('DOMContentLoaded', (): void => {
    void carregarCategorias();
    void carregarPainel(false);
    void carregarTabela();

    const botao = elemento('btn-atualizar');
    if (botao) {
        botao.addEventListener('click', (): void => {
            void carregarPainel(true);
            void carregarTabela();
        });
    }

    const limpar = elemento('btn-limpar');
    if (limpar) {
        limpar.addEventListener('click', limparFiltros);
    }

    const formFiltros = elemento('form-filtros');
    if (formFiltros instanceof HTMLFormElement) {
        formFiltros.addEventListener('submit', (evento: SubmitEvent): void => {
            evento.preventDefault();
            aplicarFiltros();
        });
    }

    const formBusca = elemento('form-busca');
    if (formBusca instanceof HTMLFormElement) {
        formBusca.addEventListener('submit', (evento: SubmitEvent): void => {
            evento.preventDefault();
            filtro.busca = valorCampo('campo-busca');
            filtro.pagina = 1;
            void carregarTabela();
        });
    }
});
