<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/conexao.php';

header('Content-Type: application/json; charset=utf-8');

function responder(bool $sucesso, array $dados, string $mensagem, int $http = 200): void
{
    http_response_code($http);
    echo json_encode(
        ['sucesso' => $sucesso, 'dados' => $dados, 'mensagem' => $mensagem],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

try {
    $pdo = conectar();

    $sql = 'SELECT id, nome FROM categoria ORDER BY nome ASC';

    $linhas = $pdo->query($sql)->fetchAll();

    $dados = array_map(static function (array $l): array {
        $l['id'] = (int) $l['id'];
        return $l;
    }, $linhas);

    responder(true, $dados, count($dados) . ' categorias encontradas.');

} catch (PDOException $e) {
    error_log('[dw-obras] falha no banco: ' . $e->getMessage());
    responder(false, [], 'Não foi possível consultar o banco de dados.', 500);

} catch (Throwable $e) {
    error_log('[dw-obras] falha inesperada: ' . $e->getMessage());
    responder(false, [], 'Erro inesperado no servidor.', 500);
}
