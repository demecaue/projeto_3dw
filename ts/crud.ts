import type { SituacaoEstoque, StatusObra } from './tipos.js';
import { criar, elemento, escrever, exibir } from './dom.js';

// Desenvolvimento Web Avancada: partes comuns dos 3 CRUDs (modal, confirmacao e mensagens)

interface ModalBootstrap {
    show(): void;
    hide(): void;
}

interface ToastBootstrap {
    show(): void;
}

interface BibliotecaBootstrap {
    Modal: { getOrCreateInstance(alvo: Element): ModalBootstrap };
    Toast: { getOrCreateInstance(alvo: Element): ToastBootstrap };
}

declare const bootstrap: BibliotecaBootstrap;

export const ROTULO_ESTOQUE: Record<SituacaoEstoque, string> = {
    CRITICO: 'Crítico',
    ATENCAO: 'Atenção',
    OK: 'Normal'
};

export const ROTULO_STATUS: Record<StatusObra, string> = {
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    PARALISADA: 'Paralisada'
};

export function badgeEstoque(situacao: SituacaoEstoque): HTMLSpanElement {
    const classe = situacao === 'CRITICO'
        ? 'dw-badge--critico'
        : situacao === 'ATENCAO'
            ? 'dw-badge--atencao'
            : 'dw-badge--ok';
    return criar('span', `badge dw-badge ${classe}`, ROTULO_ESTOQUE[situacao]);
}

export function abrirModal(id: string): void {
    const janela = elemento(id);
    if (janela) {
        bootstrap.Modal.getOrCreateInstance(janela).show();
    }
}

export function fecharModal(id: string): void {
    const janela = elemento(id);
    if (janela) {
        bootstrap.Modal.getOrCreateInstance(janela).hide();
    }
}

export function mostrarMensagem(texto: string, sucesso: boolean): void {
    const toast = elemento('toast-mensagem');
    if (!toast) {
        return;
    }
    toast.classList.toggle('dw-toast--erro', !sucesso);
    escrever('texto-toast', texto);
    bootstrap.Toast.getOrCreateInstance(toast).show();
}

export function mostrarErroFormulario(texto: string): void {
    escrever('form-erro', texto);
    exibir('form-erro', texto !== '');
}

// Desenvolvimento Web Avancada: confirmacao antes de excluir
export function confirmar(mensagem: string): Promise<boolean> {
    return new Promise((resolver: (confirmado: boolean) => void): void => {
        const janela = elemento('modal-confirmar');
        const botao = elemento('btn-confirmar');
        if (!janela || !botao) {
            resolver(false);
            return;
        }

        let confirmado = false;
        const aoConfirmar = (): void => {
            confirmado = true;
            fecharModal('modal-confirmar');
        };

        escrever('texto-confirmar', mensagem);
        botao.addEventListener('click', aoConfirmar, { once: true });
        janela.addEventListener('hidden.bs.modal', (): void => {
            botao.removeEventListener('click', aoConfirmar);
            resolver(confirmado);
        }, { once: true });

        abrirModal('modal-confirmar');
    });
}

export function botoesAcao(aoEditar: () => void, aoExcluir: () => void): HTMLTableCellElement {
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

export function estadoLista(estado: 'carregando' | 'erro' | 'lista'): void {
    exibir('bloco-carregando', estado === 'carregando');
    exibir('bloco-erro', estado === 'erro');
    exibir('bloco-lista', estado === 'lista');
}

export function aoClicar(id: string, acao: () => void): void {
    const alvo = elemento(id);
    if (alvo) {
        alvo.addEventListener('click', acao);
    }
}

export function aoEnviar(id: string, acao: () => void): void {
    const formulario = elemento(id);
    if (formulario instanceof HTMLFormElement) {
        formulario.addEventListener('submit', (evento: SubmitEvent): void => {
            evento.preventDefault();
            acao();
        });
    }
}
