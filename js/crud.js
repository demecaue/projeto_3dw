import { criar, elemento, escrever, exibir } from './dom.js';
export const ROTULO_ESTOQUE = {
    CRITICO: 'Crítico',
    ATENCAO: 'Atenção',
    OK: 'Normal'
};
export const ROTULO_STATUS = {
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    PARALISADA: 'Paralisada'
};
export function badgeEstoque(situacao) {
    const classe = situacao === 'CRITICO'
        ? 'dw-badge--critico'
        : situacao === 'ATENCAO'
            ? 'dw-badge--atencao'
            : 'dw-badge--ok';
    return criar('span', `badge dw-badge ${classe}`, ROTULO_ESTOQUE[situacao]);
}
export function abrirModal(id) {
    const janela = elemento(id);
    if (janela) {
        bootstrap.Modal.getOrCreateInstance(janela).show();
    }
}
export function fecharModal(id) {
    const janela = elemento(id);
    if (janela) {
        bootstrap.Modal.getOrCreateInstance(janela).hide();
    }
}
export function mostrarMensagem(texto, sucesso) {
    const toast = elemento('toast-mensagem');
    if (!toast) {
        return;
    }
    toast.classList.toggle('dw-toast--erro', !sucesso);
    escrever('texto-toast', texto);
    bootstrap.Toast.getOrCreateInstance(toast).show();
}
export function mostrarErroFormulario(texto) {
    escrever('form-erro', texto);
    exibir('form-erro', texto !== '');
}
export function confirmar(mensagem) {
    return new Promise((resolver) => {
        const janela = elemento('modal-confirmar');
        const botao = elemento('btn-confirmar');
        if (!janela || !botao) {
            resolver(false);
            return;
        }
        let confirmado = false;
        const aoConfirmar = () => {
            confirmado = true;
            fecharModal('modal-confirmar');
        };
        escrever('texto-confirmar', mensagem);
        botao.addEventListener('click', aoConfirmar, { once: true });
        janela.addEventListener('hidden.bs.modal', () => {
            botao.removeEventListener('click', aoConfirmar);
            resolver(confirmado);
        }, { once: true });
        abrirModal('modal-confirmar');
    });
}
export function botoesAcao(aoEditar, aoExcluir) {
    const editar = criar('button', 'btn btn-sm dw-btn-secundario', 'Editar');
    editar.type = 'button';
    editar.addEventListener('click', aoEditar);
    const remover = criar('button', 'btn btn-sm dw-btn-excluir', 'Excluir');
    remover.type = 'button';
    remover.addEventListener('click', aoExcluir);
    const td = criar('td', 'text-end dw-acoes');
    td.append(editar, remover);
    return td;
}
export function estadoLista(estado) {
    exibir('bloco-carregando', estado === 'carregando');
    exibir('bloco-erro', estado === 'erro');
    exibir('bloco-lista', estado === 'lista');
}
export function aoClicar(id, acao) {
    const alvo = elemento(id);
    if (alvo) {
        alvo.addEventListener('click', acao);
    }
}
export function aoEnviar(id, acao) {
    const formulario = elemento(id);
    if (formulario instanceof HTMLFormElement) {
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            acao();
        });
    }
}
//# sourceMappingURL=crud.js.map