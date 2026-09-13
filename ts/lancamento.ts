import type { LancamentoForm, Material, Obra } from './tipos.js';
import { listar, salvar } from './api.js';
import { formatarMoeda } from './calculos.js';
import { elemento, escrever, preencherCampo, preencherSelect, valorCampo } from './dom.js';
import { abrirModal, aoClicar, aoEnviar, fecharModal, mostrarErroFormulario, mostrarMensagem } from './crud.js';

// Desenvolvimento Web Avancada: formulario de novo lancamento aberto pela dashboard

let materiais: Material[] = [];

function hoje(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
}

// Logica Avancada: filter deixa so as obras em andamento no select
async function carregarOpcoes(): Promise<string> {
    const [obras, listaMateriais] = await Promise.all([listar<Obra>('obras'), listar<Material>('materiais')]);

    if (!obras.ok) {
        return obras.mensagem;
    }
    if (!listaMateriais.ok) {
        return listaMateriais.mensagem;
    }

    const emAndamento = obras.dados.filter((obra: Obra): boolean => obra.status === 'EM_ANDAMENTO');
    preencherSelect('campo-obra', emAndamento.map((obra: Obra): { valor: string; texto: string } => ({
        valor: String(obra.id),
        texto: `${obra.titulo} (${obra.cliente})`
    })));

    materiais = listaMateriais.dados;
    preencherSelect('campo-material', materiais.map((material: Material): { valor: string; texto: string } => ({
        valor: String(material.id),
        texto: `${material.nome} - saldo ${material.estoque_atual} ${material.unidade}`
    })));

    return '';
}

function mostrarInfoMaterial(): void {
    const escolhido = materiais.find((material: Material): boolean => String(material.id) === valorCampo('campo-material'));
    if (escolhido === undefined) {
        escrever('info-material', 'O valor unitário vem do cadastro do material.');
        return;
    }
    escrever(
        'info-material',
        `${formatarMoeda(escolhido.valor_unitario)} por ${escolhido.unidade}. Saldo atual: ${escolhido.estoque_atual} ${escolhido.unidade}.`
    );
}

async function abrirFormulario(): Promise<void> {
    preencherCampo('campo-quantidade', '');
    preencherCampo('campo-data', hoje());
    mostrarErroFormulario('');
    abrirModal('modal-form');

    // recarrega sempre, porque o saldo muda a cada lancamento
    const erro = await carregarOpcoes();
    mostrarErroFormulario(erro);
    mostrarInfoMaterial();
}

function lerFormulario(): LancamentoForm {
    return {
        obra_id: Number(valorCampo('campo-obra')),
        material_id: Number(valorCampo('campo-material')),
        quantidade: Number(valorCampo('campo-quantidade')),
        data_aplicacao: valorCampo('campo-data')
    };
}

async function enviar(aoSalvar: () => void): Promise<void> {
    const dados = lerFormulario();
    if (dados.obra_id === 0 || dados.material_id === 0 || dados.data_aplicacao === '') {
        mostrarErroFormulario('Escolha a obra, o material e a data.');
        return;
    }
    if (!(dados.quantidade > 0)) {
        mostrarErroFormulario('A quantidade precisa ser maior que zero.');
        return;
    }

    const resultado = await salvar<LancamentoForm>('lancamentos', dados, null);
    if (!resultado.ok) {
        mostrarErroFormulario(resultado.mensagem);
        return;
    }

    fecharModal('modal-form');
    mostrarMensagem(resultado.mensagem, true);
    aoSalvar();
}

export function iniciarNovoLancamento(aoSalvar: () => void): void {
    aoClicar('btn-novo', (): void => { void abrirFormulario(); });
    aoEnviar('form-registro', (): void => { void enviar(aoSalvar); });

    const select = elemento('campo-material');
    if (select) {
        select.addEventListener('change', mostrarInfoMaterial);
    }
}
