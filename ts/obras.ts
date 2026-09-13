import type { Cliente, Obra, ObraForm, StatusObra } from './tipos.js';
import { excluir, listar, salvar } from './api.js';
import { formatarData, formatarMoeda } from './calculos.js';
import {
    carimbarLeitura,
    celula,
    criar,
    elemento,
    escrever,
    linhaMensagem,
    preencherCampo,
    preencherSelect,
    valorCampo
} from './dom.js';
import {
    abrirModal,
    aoClicar,
    aoEnviar,
    botoesAcao,
    confirmar,
    estadoLista,
    fecharModal,
    mostrarErroFormulario,
    mostrarMensagem,
    ROTULO_STATUS
} from './crud.js';

// Desenvolvimento Web Avancada: tela do CRUD de obras

const RECURSO = 'obras';
let editandoId: number | null = null;

function lerStatus(valor: string): StatusObra {
    return valor === 'CONCLUIDA' || valor === 'PARALISADA' ? valor : 'EM_ANDAMENTO';
}

function renderizarTabela(lista: Obra[]): void {
    const corpo = elemento('corpo-tabela');
    if (!corpo) {
        return;
    }
    corpo.replaceChildren();

    if (lista.length === 0) {
        corpo.appendChild(linhaMensagem(6, 'Nenhuma obra cadastrada.'));
    }

    for (const obra of lista) {
        const ultimo = obra.ultimo_lancamento === null
            ? 'Sem lançamentos'
            : `Último em ${formatarData(obra.ultimo_lancamento)}`;

        const linha = criar('tr');
        linha.append(
            celula('col-data', formatarData(obra.data_inicio)),
            celula('',
                criar('span', 'linha-titulo', obra.titulo),
                criar('span', 'linha-sub', `${obra.cliente} - ${obra.cidade}`)
            ),
            celula('', criar('span', `badge dw-badge dw-status--${obra.status.toLowerCase()}`, ROTULO_STATUS[obra.status])),
            celula('text-end',
                criar('span', 'linha-titulo num', String(obra.total_lancamentos)),
                criar('span', 'linha-sub', ultimo)
            ),
            celula('text-end num', formatarMoeda(obra.total_aplicado)),
            botoesAcao(
                (): void => abrirFormulario(obra),
                (): void => { void pedirExclusao(obra); }
            )
        );
        corpo.appendChild(linha);
    }

    escrever('rodape-tabela', `${lista.length} obras cadastradas`);
}

async function carregarClientes(): Promise<void> {
    const resultado = await listar<Cliente>('clientes');
    if (resultado.ok) {
        preencherSelect('campo-cliente', resultado.dados.map((cliente: Cliente): { valor: string; texto: string } => ({
            valor: String(cliente.id),
            texto: cliente.nome
        })));
    }
}

async function carregar(): Promise<void> {
    estadoLista('carregando');
    const resultado = await listar<Obra>(RECURSO);

    if (!resultado.ok) {
        escrever('texto-erro', resultado.mensagem);
        estadoLista('erro');
        return;
    }

    renderizarTabela(resultado.dados);
    carimbarLeitura();
    estadoLista('lista');
}

function abrirFormulario(obra: Obra | null): void {
    editandoId = obra === null ? null : obra.id;
    escrever('titulo-form', obra === null ? 'Nova obra' : 'Editar obra');
    preencherCampo('campo-titulo', obra === null ? '' : obra.titulo);
    preencherCampo('campo-cliente', obra === null ? '' : String(obra.cliente_id));
    preencherCampo('campo-status', obra === null ? 'EM_ANDAMENTO' : obra.status);
    preencherCampo('campo-data', obra === null ? new Date().toISOString().slice(0, 10) : obra.data_inicio);
    mostrarErroFormulario('');
    abrirModal('modal-form');
}

function lerFormulario(): ObraForm {
    return {
        titulo: valorCampo('campo-titulo'),
        cliente_id: Number(valorCampo('campo-cliente')),
        status: lerStatus(valorCampo('campo-status')),
        data_inicio: valorCampo('campo-data')
    };
}

async function enviarFormulario(): Promise<void> {
    const dados = lerFormulario();
    if (dados.titulo === '' || dados.cliente_id === 0 || dados.data_inicio === '') {
        mostrarErroFormulario('Preencha título, cliente e data de início.');
        return;
    }

    const resultado = await salvar<ObraForm>(RECURSO, dados, editandoId);
    if (!resultado.ok) {
        mostrarErroFormulario(resultado.mensagem);
        return;
    }

    fecharModal('modal-form');
    mostrarMensagem(resultado.mensagem, true);
    await carregar();
}

async function pedirExclusao(obra: Obra): Promise<void> {
    const confirmado = await confirmar(`Excluir a obra "${obra.titulo}"?`);
    if (!confirmado) {
        return;
    }

    const resultado = await excluir(RECURSO, obra.id);
    mostrarMensagem(resultado.mensagem, resultado.ok);
    if (resultado.ok) {
        await carregar();
    }
}

document.addEventListener('DOMContentLoaded', (): void => {
    void carregarClientes();
    void carregar();
    aoClicar('btn-novo', (): void => abrirFormulario(null));
    aoEnviar('form-registro', (): void => { void enviarFormulario(); });
});
