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

    $sql = 'SELECT id, obra, cliente, cidade, status_obra,
                   material, categoria, unidade,
                   quantidade, valor_unitario, data_aplicacao,
                   estoque_atual, estoque_minimo, situacao_estoque
              FROM vw_aplicacoes_limpa
             ORDER BY data_aplicacao DESC, id DESC';

    $linhas = $pdo->query($sql)->fetchAll();

    $dados = array_map(static function (array $l): array {
        $l['id']             = (int)   $l['id'];
        $l['quantidade']     = (float) $l['quantidade'];
        $l['valor_unitario'] = (float) $l['valor_unitario'];
        $l['estoque_atual']  = (int)   $l['estoque_atual'];
        $l['estoque_minimo'] = (int)   $l['estoque_minimo'];
        return $l;
    }, $linhas);

    responder(true, $dados, count($dados) . ' lançamentos carregados.');

} catch (PDOException $e) {
    error_log('[dw-obras] falha no banco: ' . $e->getMessage());
    responder(false, [], 'Não foi possível consultar o banco de dados.', 500);

} catch (Throwable $e) {
    error_log('[dw-obras] falha inesperada: ' . $e->getMessage());
    responder(false, [], 'Erro inesperado no servidor.', 500);
}
