USE projeto_3dw;

DROP VIEW IF EXISTS vw_aplicacoes_limpa;

CREATE VIEW vw_aplicacoes_limpa AS
WITH aplicacoes_validas AS (
    SELECT  id,
            obra_id,
            material_id,
            ABS(quantidade)     AS quantidade,
            ABS(valor_unitario) AS valor_unitario,
            data_aplicacao
      FROM  aplicacao_material
     WHERE  quantidade    <> 0
       AND  valor_unitario > 0
),
obras_com_cliente AS (
    SELECT  o.id                     AS obra_id,
            TRIM(o.titulo)           AS obra,
            o.status                 AS status,
            TRIM(c.nome)             AS cliente,
            UPPER(TRIM(c.cidade))    AS cidade
      FROM  obra o
      JOIN  cliente c ON c.id = o.cliente_id
),
materiais_com_categoria AS (
    SELECT  m.id                     AS material_id,
            TRIM(m.nome)             AS material,
            TRIM(cat.nome)           AS categoria,
            m.unidade                AS unidade,
            m.estoque_atual          AS estoque_atual,
            m.estoque_minimo         AS estoque_minimo,
            CASE
                WHEN m.estoque_atual <= m.estoque_minimo THEN 'CRITICO'
                WHEN m.estoque_atual <= m.estoque_minimo * 1.5 THEN 'ATENCAO'
                ELSE 'OK'
            END                      AS situacao_estoque
      FROM  material m
      JOIN  categoria cat ON cat.id = m.categoria_id
)
SELECT  a.id                                        AS id,
        oc.obra                                     AS obra,
        oc.cliente                                  AS cliente,
        oc.cidade                                   AS cidade,
        oc.status                                   AS status_obra,
        mc.material                                 AS material,
        mc.categoria                                AS categoria,
        mc.unidade                                  AS unidade,
        a.quantidade                                AS quantidade,
        a.valor_unitario                            AS valor_unitario,
        DATE_FORMAT(a.data_aplicacao, '%Y-%m-%d')   AS data_aplicacao,
        mc.estoque_atual                            AS estoque_atual,
        mc.estoque_minimo                           AS estoque_minimo,
        mc.situacao_estoque                         AS situacao_estoque
  FROM  aplicacoes_validas a
  JOIN  obras_com_cliente       oc ON oc.obra_id     = a.obra_id
  JOIN  materiais_com_categoria mc ON mc.material_id = a.material_id;

DROP VIEW IF EXISTS vw_conferencia_totais;

CREATE VIEW vw_conferencia_totais AS
WITH totais AS (
    SELECT  ABS(quantidade) * ABS(valor_unitario) AS valor_linha
      FROM  aplicacao_material
     WHERE  quantidade <> 0 AND valor_unitario > 0
)
SELECT  COUNT(*)                        AS total_lancamentos,
        ROUND(SUM(valor_linha), 2)      AS total_aplicado,
        ROUND(AVG(valor_linha), 2)      AS ticket_medio
  FROM  totais;

DROP TRIGGER IF EXISTS trg_aplicacao_bu;
DROP TRIGGER IF EXISTS trg_material_bu;

DELIMITER $$

CREATE TRIGGER trg_aplicacao_bu
BEFORE UPDATE ON aplicacao_material
FOR EACH ROW
BEGIN
    SET NEW.quantidade     = ABS(NEW.quantidade);
    SET NEW.valor_unitario = ABS(NEW.valor_unitario);

    IF NEW.quantidade = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Quantidade aplicada nao pode ser zero.';
    END IF;
END$$

CREATE TRIGGER trg_material_bu
BEFORE UPDATE ON material
FOR EACH ROW
BEGIN
    SET NEW.valor_unitario = ABS(NEW.valor_unitario);
    SET NEW.estoque_atual  = ABS(NEW.estoque_atual);
    SET NEW.estoque_minimo = ABS(NEW.estoque_minimo);
END$$

DELIMITER ;
