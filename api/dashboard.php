<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

try {
    $inicio = lerData($_GET['inicio'] ?? null);
    $fim    = lerData($_GET['fim'] ?? null);

    // Banco de Dados Avancado: a API so faz o CALL, o filtro fica na procedure
    $stmt = conectar()->prepare('CALL sp_dashboard_lancamentos(?, ?)');
    $stmt->execute([$inicio, $fim]);
    $linhas = $stmt->fetchAll();
    $stmt->closeCursor();

    $dados = array_map('converterLancamento', $linhas);

    responder(true, $dados, count($dados) . ' lançamentos carregados.');

} catch (Throwable $e) {
    falhar($e);
}
