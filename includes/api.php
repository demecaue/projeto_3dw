<?php

declare(strict_types=1);

// Desenvolvimento Web Avancada: funcoes comuns a todas as APIs ficam num arquivo so

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

function falhar(Throwable $e): void
{
    error_log('[dw-obras] ' . $e->getMessage());

    if ($e instanceof PDOException) {
        responder(false, [], 'Não foi possível consultar o banco de dados.', 500);
    }
    responder(false, [], 'Erro inesperado no servidor.', 500);
}

function lerCorpo(): array
{
    $json = json_decode((string) file_get_contents('php://input'), true);
    return is_array($json) ? $json : [];
}

function lerId(): int
{
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!is_int($id) || $id <= 0) {
        responder(false, [], 'Informe um código válido.', 400);
    }
    return $id;
}

function lerTexto(array $corpo, string $campo, string $rotulo, int $maximo): string
{
    $valor = trim((string) ($corpo[$campo] ?? ''));
    if ($valor === '') {
        responder(false, [], "Preencha o campo {$rotulo}.", 422);
    }
    if (mb_strlen($valor) > $maximo) {
        responder(false, [], "O campo {$rotulo} aceita no máximo {$maximo} caracteres.", 422);
    }
    return $valor;
}

function lerNumero(array $corpo, string $campo, string $rotulo, float $minimo): float
{
    $valor = $corpo[$campo] ?? null;
    if (!is_numeric($valor) || (float) $valor < $minimo) {
        responder(false, [], "O campo {$rotulo} precisa ser um número maior ou igual a {$minimo}.", 422);
    }
    return (float) $valor;
}

function lerData(?string $valor): ?string
{
    if ($valor === null || $valor === '') {
        return null;
    }
    $data = DateTime::createFromFormat('Y-m-d', $valor);
    return $data && $data->format('Y-m-d') === $valor ? $valor : null;
}

function existe(string $tabela, int $id): bool
{
    $stmt = conectar()->prepare("SELECT COUNT(*) FROM {$tabela} WHERE id = ?");
    $stmt->execute([$id]);
    return (int) $stmt->fetchColumn() > 0;
}

function contar(string $sql, int $id): int
{
    $stmt = conectar()->prepare($sql);
    $stmt->execute([$id]);
    return (int) $stmt->fetchColumn();
}

function converterLancamento(array $l): array
{
    $l['id']             = (int)   $l['id'];
    $l['quantidade']     = (float) $l['quantidade'];
    $l['valor_unitario'] = (float) $l['valor_unitario'];
    $l['estoque_atual']  = (int)   $l['estoque_atual'];
    $l['estoque_minimo'] = (int)   $l['estoque_minimo'];
    return $l;
}
