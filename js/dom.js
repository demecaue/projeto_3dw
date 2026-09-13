export function elemento(id) {
    return document.getElementById(id);
}
export function escrever(id, texto) {
    const alvo = elemento(id);
    if (alvo) {
        alvo.textContent = texto;
    }
}
export function exibir(id, visivel) {
    const alvo = elemento(id);
    if (alvo) {
        alvo.classList.toggle('d-none', !visivel);
    }
}
export function criar(tag, classe = '', texto = '') {
    const novo = document.createElement(tag);
    if (classe !== '') {
        novo.className = classe;
    }
    if (texto !== '') {
        novo.textContent = texto;
    }
    return novo;
}
export function celula(classe, ...filhos) {
    const td = criar('td', classe);
    td.append(...filhos);
    return td;
}
export function linhaMensagem(colunas, texto) {
    const tr = criar('tr');
    const td = criar('td', 'dw-linha-vazia', texto);
    td.colSpan = colunas;
    tr.appendChild(td);
    return tr;
}
export function valorCampo(id) {
    const campo = elemento(id);
    if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) {
        return campo.value.trim();
    }
    return '';
}
export function preencherCampo(id, valor) {
    const campo = elemento(id);
    if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) {
        campo.value = valor;
    }
}
export function preencherSelect(id, opcoes) {
    const select = elemento(id);
    if (!(select instanceof HTMLSelectElement)) {
        return;
    }
    const primeira = select.options.item(0);
    select.replaceChildren();
    if (primeira) {
        select.appendChild(primeira);
    }
    for (const opcao of opcoes) {
        select.appendChild(new Option(opcao.texto, opcao.valor));
    }
}
export function carimbarLeitura() {
    escrever('carimbo-atualizacao', new Date().toLocaleTimeString('pt-BR'));
}
//# sourceMappingURL=dom.js.map