<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/api.php';

// Desenvolvimento Web Avancada: CRUD de materiais (listar, incluir, editar e excluir)

function listar(): void
{
    // Banco de Dados Avancado: fn_situacao_estoque reaproveitada fora da view
    $sql = 'SELECT m.id, m.nome, m.unidade, m.valor_unitario,
                   m.estoque_atual, m.estoque_minimo,
                   m.categoria_id, cat.nome AS categoria,
                   fn_situacao_estoque(m.estoque_atual, m.estoque_minimo) AS situacao_estoque,
                   COUNT(a.id) AS total_lancamentos
              FROM material m
              JOIN categoria cat ON cat.id = m.categoria_id
              LEFT JOIN aplicacao_material a ON a.material_id = m.id
             GROUP BY m.id, m.nome, m.unidade, m.valor_unitario,
                      m.estoque_atual, m.estoque_minimo, m.categoria_id, cat.nome
             ORDER BY m.nome';

    $dados = array_map(static function (array $l): array {
        $l['id']                = (int)   $l['id'];
        $l['valor_unitario']    = (float) $l['valor_unitario'];
        $l['estoque_atual']     = (int)   $l['estoque_atual'];
        $l['estoque_minimo']    = (int)   $l['estoque_minimo'];
        $l['categoria_id']      = (int)   $l['categoria_id'];
        $l['total_lancamentos'] = (int)   $l['total_lancamentos'];
        return $l;
    }, conectar()->query($sql)->fetchAll());

    responder(true, $dados, count($dados) . ' materiais encontrados.');
}

function lerMaterial(): array
{
    $corpo = lerCorpo();

    $categoriaId = (int) ($corpo['categoria_id'] ?? 0);
    if (!existe('categoria', $categoriaId)) {
        responder(false, [], 'Escolha uma categoria válida.', 422);
    }

    return [
        $categoriaId,
        lerTexto($corpo, 'nome', 'Nome', 120),
        lerTexto($corpo, 'unidade', 'Unidade', 10),
        lerNumero($corpo, 'valor_unitario', 'Valor unitário', 0.01),
        (int) lerNumero($corpo, 'estoque_atual', 'Estoque atual', 0),
        (int) lerNumero($corpo, 'estoque_minimo', 'Estoque mínimo', 0),
    ];
}

function incluir(): void
{
    $stmt = conectar()->prepare(
        'INSERT INTO material (categoria_id, nome, unidade, valor_unitario, estoque_atual, estoque_minimo)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute(lerMaterial());
    responder(true, [], 'Material cadastrado com sucesso.', 201);
}

function editar(): void
{
    $id = lerId();
    if (!existe('material', $id)) {
        responder(false, [], 'Material não encontrado. Ele pode ter sido excluído.', 404);
    }
    $stmt = conectar()->prepare(
        'UPDATE material
            SET categoria_id = ?, nome = ?, unidade = ?, valor_unitario = ?,
                estoque_atual = ?, estoque_minimo = ?
          WHERE id = ?'
    );
    $stmt->execute([...lerMaterial(), $id]);
    responder(true, [], 'Material atualizado com sucesso.');
}

// Desenvolvimento Web Avancada: regra de exclusao com mensagem clara para o usuario
function excluir(): void
{
    $id = lerId();
    $stmt = conectar()->prepare('SELECT nome FROM material WHERE id = ?');
    $stmt->execute([$id]);
    $nome = $stmt->fetchColumn();

    if ($nome === false) {
        responder(false, [], 'Material não encontrado. Ele pode já ter sido excluído.', 404);
    }

    $lancamentos = contar('SELECT COUNT(*) FROM aplicacao_material WHERE material_id = ?', $id);
    if ($lancamentos > 0) {
        $texto = $lancamentos === 1 ? '1 lançamento em obra' : "{$lancamentos} lançamentos em obras";
        responder(false, [], "Não é possível excluir o material {$nome}: ele possui {$texto}. Para parar de usar, zere o estoque.", 409);
    }

    conectar()->prepare('DELETE FROM material WHERE id = ?')->execute([$id]);
    responder(true, [], "Material {$nome} excluído com sucesso.");
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
