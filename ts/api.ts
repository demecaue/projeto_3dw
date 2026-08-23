import type { Aplicacao, RespostaAPI } from './tipos.js';

const ENDPOINT = '../api/dashboard.php';

export interface ResultadoBusca {
    ok: boolean;
    dados: Aplicacao[];
    erro: string;
}

export async function buscarAplicacoes(): Promise<ResultadoBusca> {
    try {
        const resposta = await fetch(ENDPOINT, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!resposta.ok) {
            throw new Error(`O servidor respondeu ${resposta.status}.`);
        }

        const json = await resposta.json() as RespostaAPI<Aplicacao[]>;

        if (!json.sucesso) {
            throw new Error(json.mensagem);
        }

        const lista = Array.isArray(json.dados) ? json.dados : [];
        return { ok: true, dados: lista, erro: '' };

    } catch (erro) {
        const detalhe = erro instanceof Error
            ? erro.message
            : 'Falha desconhecida ao consultar a API.';

        console.error('[dw-obras] falha na consulta:', erro);
        return { ok: false, dados: [], erro: detalhe };
    }
}
