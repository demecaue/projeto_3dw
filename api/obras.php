<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

// Desenvolvimento Web Avancada: CRUD de obras (listar, incluir, editar e excluir)

const STATUS_OBRA = ['EM_ANDAMENTO', 'CONCLUIDA', 'PARALISADA'];

function listar(): void
{
    // Banco de Dados Avancado: a listagem vem pronta da vw_resumo_obras
    $sql = 'SELECT id, titulo, status, data_inicio, cliente_id, cliente, cidade,
                   total_lancamentos, materiais_distintos, total_aplicado, ultimo_lancamento
              FROM vw_resumo_obras
             ORDER BY data_inicio DESC, id DESC';

    $dados = array_map(static function (array $l): array {
        $l['id']                  = (int)   $l['id'];
        $l['cliente_id']          = (int)   $l['cliente_id'];
        $l['total_lancamentos']   = (int)   $l['total_lancamentos'];
        $l['materiais_distintos'] = (int)   $l['materiais_distintos'];
        $l['total_aplicado']      = (float) $l['total_aplicado'];
        return $l;
    }, conectar()->query($sql)->fetchAll());

    responder(true, $dados, count($dados) . ' obras encontradas.');
}

function lerObra(): array
{
    $corpo = lerCorpo();

    $clienteId = (int) ($corpo['cliente_id'] ?? 0);
    if (!existe('cliente', $clienteId)) {
        responder(false, [], 'Escolha um cliente válido.', 422);
    }

    $titulo = lerTexto($corpo, 'titulo', 'Título', 140);

    $status = (string) ($corpo['status'] ?? '');
    if (!in_array($status, STATUS_OBRA, true)) {
        responder(false, [], 'Escolha uma situação válida para a obra.', 422);
    }

    $data = lerData((string) ($corpo['data_inicio'] ?? ''));
    if ($data === null) {
        responder(false, [], 'Informe a data de início.', 422);
    }

    return [$clienteId, $titulo, $status, $data];
}

function incluir(): void
{
    $stmt = conectar()->prepare(
        'INSERT INTO obra (cliente_id, titulo, status, data_inicio) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute(lerObra());
    responder(true, [], 'Obra cadastrada com sucesso.', 201);
}

function editar(): void
{
    $id = lerId();
    if (!existe('obra', $id)) {
        responder(false, [], 'Obra não encontrada. Ela pode ter sido excluída.', 404);
    }
    $stmt = conectar()->prepare(
        'UPDATE obra SET cliente_id = ?, titulo = ?, status = ?, data_inicio = ? WHERE id = ?'
    );
    $stmt->execute([...lerObra(), $id]);
    responder(true, [], 'Obra atualizada com sucesso.');
}

// Desenvolvimento Web Avancada: regra de exclusao com mensagem clara para o usuario
function excluir(): void
{
    $id = lerId();
    $stmt = conectar()->prepare('SELECT titulo FROM obra WHERE id = ?');
    $stmt->execute([$id]);
    $titulo = $stmt->fetchColumn();

    if ($titulo === false) {
        responder(false, [], 'Obra não encontrada. Ela pode já ter sido excluída.', 404);
    }

    $lancamentos = contar('SELECT COUNT(*) FROM aplicacao_material WHERE obra_id = ?', $id);
    if ($lancamentos > 0) {
        $texto = $lancamentos === 1 ? '1 lançamento de material' : "{$lancamentos} lançamentos de material";
        responder(false, [], "Não é possível excluir a obra \"{$titulo}\": ela possui {$texto}. Obras com consumo registrado ficam no histórico.", 409);
    }

    conectar()->prepare('DELETE FROM obra WHERE id = ?')->execute([$id]);
    responder(true, [], "Obra \"{$titulo}\" excluída com sucesso.");
}

try {
    match ($_SERVER['REQUEST_METHOD']) {
        'GET'    => listar(),
        'POST'   => incluir(),
        'PUT'    => editar(),
        'DELETE' => excluir(),
        default  => responder(false, [], 'Método não permitido.', 405),
    };
} catch (Throwable $e) {
    falhar($e);
}
