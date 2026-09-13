import { buscarCategorias, excluir, listar, salvar } from './api.js';
import { formatarMoeda } from './calculos.js';
import { carimbarLeitura, celula, criar, elemento, escrever, linhaMensagem, preencherCampo, preencherSelect, valorCampo } from './dom.js';
import { abrirModal, aoClicar, aoEnviar, badgeEstoque, botoesAcao, confirmar, estadoLista, fecharModal, mostrarErroFormulario, mostrarMensagem } from './crud.js';
const RECURSO = 'materiais';
let editandoId = null;
function renderizarTabela(lista) {
    const corpo = elemento('corpo-tabela');
    if (!corpo) {
        return;
    }
    corpo.replaceChildren();
    if (lista.length === 0) {
        corpo.appendChild(linhaMensagem(5, 'Nenhum material cadastrado.'));
    }
    for (const material of lista) {
        const linha = criar('tr');
        linha.append(celula('', criar('span', 'linha-titulo', material.nome), criar('span', 'linha-sub', material.categoria)), celula('text-end num', `${formatarMoeda(material.valor_unitario)} / ${material.unidade}`), celula('text-end col-estoque', criar('span', 'linha-saldo num', `${material.estoque_atual} / mín. ${material.estoque_minimo}`), badgeEstoque(material.situacao_estoque)), celula('text-end num', String(material.total_lancamentos)), botoesAcao(() => abrirFormulario(material), () => { void pedirExclusao(material); }));
        corpo.appendChild(linha);
    }
    escrever('rodape-tabela', `${lista.length} materiais cadastrados`);
}
async function carregarCategorias() {
    const resultado = await buscarCategorias();
    if (resultado.ok) {
        preencherSelect('campo-categoria', resultado.dados.map((categoria) => ({
            valor: String(categoria.id),
            texto: categoria.nome
        })));
    }
}
async function carregar() {
    estadoLista('carregando');
    const resultado = await listar(RECURSO);
    if (!resultado.ok) {
        escrever('texto-erro', resultado.mensagem);
        estadoLista('erro');
        return;
    }
    renderizarTabela(resultado.dados);
    carimbarLeitura();
    estadoLista('lista');
}
function abrirFormulario(material) {
    editandoId = material === null ? null : material.id;
    escrever('titulo-form', material === null ? 'Novo material' : 'Editar material');
    preencherCampo('campo-nome', material === null ? '' : material.nome);
    preencherCampo('campo-categoria', material === null ? '' : String(material.categoria_id));
    preencherCampo('campo-unidade', material === null ? '' : material.unidade);
    preencherCampo('campo-valor', material === null ? '' : String(material.valor_unitario));
    preencherCampo('campo-estoque', material === null ? '0' : String(material.estoque_atual));
    preencherCampo('campo-minimo', material === null ? '0' : String(material.estoque_minimo));
    mostrarErroFormulario('');
    abrirModal('modal-form');
}
function lerFormulario() {
    return {
        nome: valorCampo('campo-nome'),
        categoria_id: Number(valorCampo('campo-categoria')),
        unidade: valorCampo('campo-unidade'),
        valor_unitario: Number(valorCampo('campo-valor')),
        estoque_atual: Number(valorCampo('campo-estoque')),
        estoque_minimo: Number(valorCampo('campo-minimo'))
    };
}
async function enviarFormulario() {
    const dados = lerFormulario();
    if (dados.nome === '' || dados.categoria_id === 0 || dados.unidade === '') {
        mostrarErroFormulario('Preencha nome, categoria e unidade.');
        return;
    }
    if (!(dados.valor_unitario > 0) || !(dados.estoque_atual >= 0) || !(dados.estoque_minimo >= 0)) {
        mostrarErroFormulario('Valor precisa ser maior que zero e os estoques não podem ser negativos.');
        return;
    }
    const resultado = await salvar(RECURSO, dados, editandoId);
    if (!resultado.ok) {
        mostrarErroFormulario(resultado.mensagem);
        return;
    }
    fecharModal('modal-form');
    mostrarMensagem(resultado.mensagem, true);
    await carregar();
}
async function pedirExclusao(material) {
    const confirmado = await confirmar(`Excluir o material ${material.nome}?`);
    if (!confirmado) {
        return;
    }
    const resultado = await excluir(RECURSO, material.id);
    mostrarMensagem(resultado.mensagem, resultado.ok);
    if (resultado.ok) {
        await carregar();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    void carregarCategorias();
    void carregar();
    aoClicar('btn-novo', () => abrirFormulario(null));
    aoEnviar('form-registro', () => { void enviarFormulario(); });
});
//# sourceMappingURL=materiais.js.map