<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

const POR_PAGINA = 10;

function listar(): void
{
    $pagina = filter_input(INPUT_GET, 'pagina', FILTER_VALIDATE_INT);
    $pagina = is_int($pagina) && $pagina > 0 ? $pagina : 1;

    // Banco de Dados Avancado: busca, filtros e paginacao resolvidos pela procedure
    $stmt = conectar()->prepare('CALL sp_paginar_lancamentos(?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        trim((string) ($_GET['busca'] ?? '')),
        trim((string) ($_GET['categoria'] ?? '')),
        lerData($_GET['inicio'] ?? null),
        lerData($_GET['fim'] ?? null),
        $pagina,
        POR_PAGINA,
    ]);
    $linhas = $stmt->fetchAll();
    $stmt->closeCursor();

    $total = count($linhas) > 0 ? (int) $linhas[0]['total_registros'] : 0;

    $itens = array_map(static function (array $l): array {
        unset($l['total_registros']);
        return converterLancamento($l);
    }, $linhas);

    responder(true, [
        'itens'         => $itens,
        'total'         => $total,
        'pagina'        => $pagina,
        'por_pagina'    => POR_PAGINA,
        'total_paginas' => (int) ceil($total / POR_PAGINA),
    ], "{$total} lançamentos encontrados.");
}

// Desenvolvimento Web Avancada: novo lancamento de material com baixa no estoque
function incluir(): void
{
    $corpo = lerCorpo();
    $pdo   = conectar();

    $obraId     = (int) ($corpo['obra_id'] ?? 0);
    $materialId = (int) ($corpo['material_id'] ?? 0);
    $quantidade = lerNumero($corpo, 'quantidade', 'Quantidade', 0.01);
    $data       = lerData((string) ($corpo['data_aplicacao'] ?? ''));

    if ($data === null) {
        responder(false, [], 'Informe a data do lançamento.', 422);
    }

    $stmt = $pdo->prepare('SELECT titulo, status FROM obra WHERE id = ?');
    $stmt->execute([$obraId]);
    $obra = $stmt->fetch();
    if ($obra === false) {
        responder(false, [], 'Escolha uma obra válida.', 422);
    }
    if ($obra['status'] !== 'EM_ANDAMENTO') {
        responder(false, [], "A obra \"{$obra['titulo']}\" não está em andamento. Só entra material em obra em andamento.", 422);
    }

    $stmt = $pdo->prepare('SELECT nome, unidade, valor_unitario, estoque_atual FROM material WHERE id = ?');
    $stmt->execute([$materialId]);
    $material = $stmt->fetch();
    if ($material === false) {
        responder(false, [], 'Escolha um material válido.', 422);
    }

    // estoque e inteiro: 54,96 m de cabo baixam 55 m do rolo
    $baixa = (int) ceil($quantidade);

    $pdo->beginTransaction();
    try {
        // o WHERE com estoque_atual >= ? impede saldo negativo mesmo com dois lancamentos ao mesmo tempo
        $stmt = $pdo->prepare(
            'UPDATE material SET estoque_atual = estoque_atual - ? WHERE id = ? AND estoque_atual >= ?'
        );
        $stmt->execute([$baixa, $materialId, $baixa]);

        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            responder(false, [], "Estoque insuficiente de {$material['nome']}: o saldo é {$material['estoque_atual']} {$material['unidade']} e o lançamento pede {$baixa} {$material['unidade']}.", 409);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO aplicacao_material (obra_id, material_id, quantidade, valor_unitario, data_aplicacao)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$obraId, $materialId, $quantidade, $material['valor_unitario'], $data]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    $saldo = (int) $material['estoque_atual'] - $baixa;
    responder(true, [], "Lançamento registrado. Novo saldo de {$material['nome']}: {$saldo} {$material['unidade']}.", 201);
}

try {
    match ($_SERVER['REQUEST_METHOD']) {
        'GET'   => listar(),
        'POST'  => incluir(),
        default => responder(false, [], 'Método não permitido.', 405),
    };
} catch (Throwable $e) {
    falhar($e);
}
