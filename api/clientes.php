<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

// Desenvolvimento Web Avancada: CRUD de clientes (listar, incluir, editar e excluir)

function listar(): void
{
    $sql = 'SELECT c.id, c.nome, c.cidade, COUNT(o.id) AS total_obras
              FROM cliente c
              LEFT JOIN obra o ON o.cliente_id = c.id
             GROUP BY c.id, c.nome, c.cidade
             ORDER BY c.nome';

    $dados = array_map(static function (array $l): array {
        $l['id']          = (int) $l['id'];
        $l['total_obras'] = (int) $l['total_obras'];
        return $l;
    }, conectar()->query($sql)->fetchAll());

    responder(true, $dados, count($dados) . ' clientes encontrados.');
}

function lerCliente(): array
{
    $corpo = lerCorpo();
    return [
        lerTexto($corpo, 'nome', 'Nome', 120),
        lerTexto($corpo, 'cidade', 'Cidade', 80),
    ];
}

function incluir(): void
{
    $stmt = conectar()->prepare('INSERT INTO cliente (nome, cidade) VALUES (?, ?)');
    $stmt->execute(lerCliente());
    responder(true, [], 'Cliente cadastrado com sucesso.', 201);
}

function editar(): void
{
    $id = lerId();
    if (!existe('cliente', $id)) {
        responder(false, [], 'Cliente não encontrado. Ele pode ter sido excluído.', 404);
    }
    $stmt = conectar()->prepare('UPDATE cliente SET nome = ?, cidade = ? WHERE id = ?');
    $stmt->execute([...lerCliente(), $id]);
    responder(true, [], 'Cliente atualizado com sucesso.');
}

// Desenvolvimento Web Avancada: regra de exclusao com mensagem clara para o usuario
function excluir(): void
{
    $id = lerId();
    $stmt = conectar()->prepare('SELECT nome FROM cliente WHERE id = ?');
    $stmt->execute([$id]);
    $nome = $stmt->fetchColumn();

    if ($nome === false) {
        responder(false, [], 'Cliente não encontrado. Ele pode já ter sido excluído.', 404);
    }

    $obras = contar('SELECT COUNT(*) FROM obra WHERE cliente_id = ?', $id);
    if ($obras > 0) {
        $texto = $obras === 1 ? '1 obra cadastrada' : "{$obras} obras cadastradas";
        responder(false, [], "Não é possível excluir o cliente {$nome}: ele possui {$texto}. Exclua ou transfira as obras antes.", 409);
    }

    conectar()->prepare('DELETE FROM cliente WHERE id = ?')->execute([$id]);
    responder(true, [], "Cliente {$nome} excluído com sucesso.");
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
