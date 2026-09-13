import type {
    Aplicacao,
    Categoria,
    FiltroLancamentos,
    PaginaLancamentos,
    RespostaAPI,
    Resultado,
    SemDados
} from './tipos.js';

// Tech Forge: este modulo so busca dados, quem processa e renderiza sao os outros

const BASE = '../api/';

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Tech Forge: consumo da API com fetch, async/await e try/catch
async function requisitar<T>(caminho: string, metodo: Metodo = 'GET', corpo?: object): Promise<Resultado<T>> {
    try {
        const opcoes: RequestInit = {
            method: metodo,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            cache: 'no-store'
        };
        if (corpo !== undefined) {
            opcoes.body = JSON.stringify(corpo);
        }

        const resposta = await fetch(BASE + caminho, opcoes);

        let json: RespostaAPI<T>;
        try {
            json = await resposta.json() as RespostaAPI<T>;
        } catch {
            throw new Error(`O servidor respondeu ${resposta.status} sem JSON válido.`);
        }

        if (!resposta.ok || !json.sucesso) {
            return { ok: false, mensagem: json.mensagem };
        }
        return { ok: true, dados: json.dados, mensagem: json.mensagem };

    } catch (erro) {
        console.error('[dw-obras] falha na consulta:', erro);

        if (erro instanceof TypeError) {
            return { ok: false, mensagem: 'O servidor não respondeu.' };
        }
        const detalhe = erro instanceof Error ? erro.message : 'Falha desconhecida ao consultar a API.';
        return { ok: false, mensagem: detalhe };
    }
}

function montarConsulta(filtro: Partial<FiltroLancamentos>): string {
    const parametros = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtro)) {
        if (valor !== undefined && valor !== '') {
            parametros.set(chave, String(valor));
        }
    }
    const texto = parametros.toString();
    return texto === '' ? '' : `?${texto}`;
}

export function buscarAplicacoes(inicio: string, fim: string): Promise<Resultado<Aplicacao[]>> {
    return requisitar<Aplicacao[]>(`dashboard.php${montarConsulta({ inicio, fim })}`);
}

export function buscarPaginaLancamentos(filtro: FiltroLancamentos): Promise<Resultado<PaginaLancamentos>> {
    return requisitar<PaginaLancamentos>(`lancamentos.php${montarConsulta(filtro)}`);
}

export function buscarCategorias(): Promise<Resultado<Categoria[]>> {
    return requisitar<Categoria[]>('categorias.php');
}

export function listar<T>(recurso: string): Promise<Resultado<T[]>> {
    return requisitar<T[]>(`${recurso}.php`);
}

export function salvar<F extends object>(recurso: string, dados: F, id: number | null): Promise<Resultado<SemDados>> {
    return id === null
        ? requisitar<SemDados>(`${recurso}.php`, 'POST', dados)
        : requisitar<SemDados>(`${recurso}.php?id=${id}`, 'PUT', dados);
}

export function excluir(recurso: string, id: number): Promise<Resultado<SemDados>> {
    return requisitar<SemDados>(`${recurso}.php?id=${id}`, 'DELETE');
}
