<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

try {
    $linhas = conectar()->query('SELECT id, nome FROM categoria ORDER BY nome ASC')->fetchAll();

    $dados = array_map(static function (array $l): array {
        $l['id'] = (int) $l['id'];
        return $l;
    }, $linhas);

    responder(true, $dados, count($dados) . ' categorias encontradas.');

} catch (Throwable $e) {
    falhar($e);
}
