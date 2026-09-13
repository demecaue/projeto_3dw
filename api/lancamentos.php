<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

const POR_PAGINA = 10;

try {
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

} catch (Throwable $e) {
    falhar($e);
}
