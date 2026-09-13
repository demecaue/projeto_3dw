const BASE = '../api/';
async function requisitar(caminho, metodo = 'GET', corpo) {
    try {
        const opcoes = {
            method: metodo,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            cache: 'no-store'
        };
        if (corpo !== undefined) {
            opcoes.body = JSON.stringify(corpo);
        }
        const resposta = await fetch(BASE + caminho, opcoes);
        let json;
        try {
            json = await resposta.json();
        }
        catch {
            throw new Error(`O servidor respondeu ${resposta.status} sem JSON válido.`);
        }
        if (!resposta.ok || !json.sucesso) {
            return { ok: false, mensagem: json.mensagem };
        }
        return { ok: true, dados: json.dados, mensagem: json.mensagem };
    }
    catch (erro) {
        console.error('[dw-obras] falha na consulta:', erro);
        if (erro instanceof TypeError) {
            return { ok: false, mensagem: 'O servidor não respondeu.' };
        }
        const detalhe = erro instanceof Error ? erro.message : 'Falha desconhecida ao consultar a API.';
        return { ok: false, mensagem: detalhe };
    }
}
function montarConsulta(filtro) {
    const parametros = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtro)) {
        if (valor !== undefined && valor !== '') {
            parametros.set(chave, String(valor));
        }
    }
    const texto = parametros.toString();
    return texto === '' ? '' : `?${texto}`;
}
export function buscarAplicacoes(inicio, fim) {
    return requisitar(`dashboard.php${montarConsulta({ inicio, fim })}`);
}
export function buscarPaginaLancamentos(filtro) {
    return requisitar(`lancamentos.php${montarConsulta(filtro)}`);
}
export function buscarCategorias() {
    return requisitar('categorias.php');
}
export function listar(recurso) {
    return requisitar(`${recurso}.php`);
}
export function salvar(recurso, dados, id) {
    return id === null
        ? requisitar(`${recurso}.php`, 'POST', dados)
        : requisitar(`${recurso}.php?id=${id}`, 'PUT', dados);
}
export function excluir(recurso, id) {
    return requisitar(`${recurso}.php?id=${id}`, 'DELETE');
}
//# sourceMappingURL=api.js.map