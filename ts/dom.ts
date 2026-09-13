// Tech Forge: manipulacao segura do DOM, sempre testando null com if e sem o operador !

export function elemento(id: string): HTMLElement | null {
    return document.getElementById(id);
}

export function escrever(id: string, texto: string): void {
    const alvo = elemento(id);
    if (alvo) {
        alvo.textContent = texto;
    }
}

export function exibir(id: string, visivel: boolean): void {
    const alvo = elemento(id);
    if (alvo) {
        alvo.classList.toggle('d-none', !visivel);
    }
}

// textContent em vez de innerHTML: texto vindo do banco nunca vira HTML
export function criar<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    classe: string = '',
    texto: string = ''
): HTMLElementTagNameMap[K] {
    const novo = document.createElement(tag);
    if (classe !== '') {
        novo.className = classe;
    }
    if (texto !== '') {
        novo.textContent = texto;
    }
    return novo;
}

export function celula(classe: string, ...filhos: (Node | string)[]): HTMLTableCellElement {
    const td = criar('td', classe);
    td.append(...filhos);
    return td;
}

export function linhaMensagem(colunas: number, texto: string): HTMLTableRowElement {
    const tr = criar('tr');
    const td = criar('td', 'dw-linha-vazia', texto);
    td.colSpan = colunas;
    tr.appendChild(td);
    return tr;
}

export function valorCampo(id: string): string {
    const campo = elemento(id);
    if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) {
        return campo.value.trim();
    }
    return '';
}

export function preencherCampo(id: string, valor: string): void {
    const campo = elemento(id);
    if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) {
        campo.value = valor;
    }
}

export function preencherSelect(id: string, opcoes: { valor: string; texto: string }[]): void {
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

export function carimbarLeitura(): void {
    escrever('carimbo-atualizacao', new Date().toLocaleTimeString('pt-BR'));
}
