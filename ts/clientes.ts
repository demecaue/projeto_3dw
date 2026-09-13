import type { Cliente, ClienteForm } from './tipos.js';
import { excluir, listar, salvar } from './api.js';
import { carimbarLeitura, celula, criar, elemento, escrever, linhaMensagem, preencherCampo, valorCampo } from './dom.js';
import {
    abrirModal,
    aoClicar,
    aoEnviar,
    botoesAcao,
    confirmar,
    estadoLista,
    fecharModal,
    mostrarErroFormulario,
    mostrarMensagem
} from './crud.js';

// Desenvolvimento Web Avancada: tela do CRUD de clientes

const RECURSO = 'clientes';
let editandoId: number | null = null;

function renderizarTabela(lista: Cliente[]): void {
    const corpo = elemento('corpo-tabela');
    if (!corpo) {
        return;
    }
    corpo.replaceChildren();

    if (lista.length === 0) {
        corpo.appendChild(linhaMensagem(4, 'Nenhum cliente cadastrado.'));
    }

    for (const cliente of lista) {
        const linha = criar('tr');
        linha.append(
            celula('', criar('span', 'linha-titulo', cliente.nome)),
            celula('', cliente.cidade),
            celula('text-end num', String(cliente.total_obras)),
            botoesAcao(
                (): void => abrirFormulario(cliente),
                (): void => { void pedirExclusao(cliente); }
            )
        );
        corpo.appendChild(linha);
    }

    escrever('rodape-tabela', `${lista.length} clientes cadastrados`);
}

async function carregar(): Promise<void> {
    estadoLista('carregando');
    const resultado = await listar<Cliente>(RECURSO);

    if (!resultado.ok) {
        escrever('texto-erro', resultado.mensagem);
        estadoLista('erro');
        return;
    }

    renderizarTabela(resultado.dados);
    carimbarLeitura();
    estadoLista('lista');
}

function abrirFormulario(cliente: Cliente | null): void {
    editandoId = cliente === null ? null : cliente.id;
    escrever('titulo-form', cliente === null ? 'Novo cliente' : 'Editar cliente');
    preencherCampo('campo-nome', cliente === null ? '' : cliente.nome);
    preencherCampo('campo-cidade', cliente === null ? '' : cliente.cidade);
    mostrarErroFormulario('');
    abrirModal('modal-form');
}

function lerFormulario(): ClienteForm {
    return {
        nome: valorCampo('campo-nome'),
        cidade: valorCampo('campo-cidade')
    };
}

async function enviarFormulario(): Promise<void> {
    const dados = lerFormulario();
    if (dados.nome === '' || dados.cidade === '') {
        mostrarErroFormulario('Preencha nome e cidade.');
        return;
    }

    const resultado = await salvar<ClienteForm>(RECURSO, dados, editandoId);
    if (!resultado.ok) {
        mostrarErroFormulario(resultado.mensagem);
        return;
    }

    fecharModal('modal-form');
    mostrarMensagem(resultado.mensagem, true);
    await carregar();
}

async function pedirExclusao(cliente: Cliente): Promise<void> {
    const confirmado = await confirmar(`Excluir o cliente ${cliente.nome}?`);
    if (!confirmado) {
        return;
    }

    const resultado = await excluir(RECURSO, cliente.id);
    mostrarMensagem(resultado.mensagem, resultado.ok);
    if (resultado.ok) {
        await carregar();
    }
}

document.addEventListener('DOMContentLoaded', (): void => {
    void carregar();
    aoClicar('btn-novo', (): void => abrirFormulario(null));
    aoEnviar('form-registro', (): void => { void enviarFormulario(); });
});
