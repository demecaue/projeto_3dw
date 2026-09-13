USE projeto_3dw;

DROP VIEW IF EXISTS vw_aplicacoes_limpa;
DROP VIEW IF EXISTS vw_conferencia_totais;
DROP VIEW IF EXISTS vw_resumo_obras;
DROP FUNCTION IF EXISTS fn_situacao_estoque;
DROP PROCEDURE IF EXISTS sp_dashboard_lancamentos;
DROP PROCEDURE IF EXISTS sp_paginar_lancamentos;
DROP TRIGGER IF EXISTS trg_aplicacao_bu;
DROP TRIGGER IF EXISTS trg_material_bu;

DELIMITER $$

-- Banco de Dados Avancado: funcao reutilizada nas views, procedures e na API de materiais
CREATE FUNCTION fn_situacao_estoque(p_atual INT, p_minimo INT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    IF p_atual <= p_minimo THEN
        RETURN 'CRITICO';
    END IF;
    IF p_atual <= p_minimo * 1.5 THEN
        RETURN 'ATENCAO';
    END IF;
    RETURN 'OK';
END$$

DELIMITER ;

-- Banco de Dados Avancado: CTEs e view analitica que limpa os dados brutos
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
            fn_situacao_estoque(m.estoque_atual, m.estoque_minimo) AS situacao_estoque
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

-- Banco de Dados Avancado: view que centraliza obra, cliente e lancamentos numa linha so
CREATE VIEW vw_resumo_obras AS
SELECT  o.id                                                    AS id,
        TRIM(o.titulo)                                          AS titulo,
        o.status                                                AS status,
        DATE_FORMAT(o.data_inicio, '%Y-%m-%d')                  AS data_inicio,
        c.id                                                    AS cliente_id,
        TRIM(c.nome)                                            AS cliente,
        TRIM(c.cidade)                                          AS cidade,
        COUNT(a.id)                                             AS total_lancamentos,
        COUNT(DISTINCT m.id)                                    AS materiais_distintos,
        ROUND(COALESCE(SUM(ABS(a.quantidade) * ABS(a.valor_unitario)), 0), 2) AS total_aplicado,
        DATE_FORMAT(MAX(a.data_aplicacao), '%Y-%m-%d')          AS ultimo_lancamento
  FROM  obra o
  JOIN  cliente c                 ON c.id = o.cliente_id
  LEFT JOIN aplicacao_material a  ON a.obra_id = o.id
  LEFT JOIN material m            ON m.id = a.material_id
 GROUP BY o.id, o.titulo, o.status, o.data_inicio, c.id, c.nome, c.cidade;

DELIMITER $$

-- Banco de Dados Avancado: procedure com filtro de periodo para os indicadores da dashboard
CREATE PROCEDURE sp_dashboard_lancamentos(IN p_inicio DATE, IN p_fim DATE)
BEGIN
    SELECT  id, obra, cliente, cidade, status_obra,
            material, categoria, unidade,
            quantidade, valor_unitario, data_aplicacao,
            estoque_atual, estoque_minimo, situacao_estoque
      FROM  vw_aplicacoes_limpa
     WHERE  (p_inicio IS NULL OR data_aplicacao >= p_inicio)
       AND  (p_fim    IS NULL OR data_aplicacao <= p_fim)
     ORDER BY data_aplicacao DESC, id DESC;
END$$

-- Banco de Dados Avancado: procedure com busca, filtros e paginacao da tabela de lancamentos
CREATE PROCEDURE sp_paginar_lancamentos(
    IN p_busca      VARCHAR(120),
    IN p_categoria  VARCHAR(60),
    IN p_inicio     DATE,
    IN p_fim        DATE,
    IN p_pagina     INT,
    IN p_por_pagina INT
)
BEGIN
    DECLARE v_pagina     INT DEFAULT GREATEST(IFNULL(p_pagina, 1), 1);
    DECLARE v_por_pagina INT DEFAULT LEAST(GREATEST(IFNULL(p_por_pagina, 10), 1), 50);
    DECLARE v_pular      INT DEFAULT 0;

    SET v_pular = (v_pagina - 1) * v_por_pagina;

    -- COUNT OVER devolve o total sem precisar de uma segunda consulta
    SELECT  id, obra, cliente, cidade, status_obra,
            material, categoria, unidade,
            quantidade, valor_unitario, data_aplicacao,
            estoque_atual, estoque_minimo, situacao_estoque,
            COUNT(*) OVER () AS total_registros
      FROM  vw_aplicacoes_limpa
     WHERE  (p_busca IS NULL OR p_busca = ''
             OR material LIKE CONCAT('%', p_busca, '%')
             OR obra     LIKE CONCAT('%', p_busca, '%')
             OR cliente  LIKE CONCAT('%', p_busca, '%'))
       AND  (p_categoria IS NULL OR p_categoria = '' OR categoria = p_categoria)
       AND  (p_inicio IS NULL OR data_aplicacao >= p_inicio)
       AND  (p_fim    IS NULL OR data_aplicacao <= p_fim)
     ORDER BY data_aplicacao DESC, id DESC
     LIMIT v_pular, v_por_pagina;
END$$

-- Banco de Dados Avancado: triggers BEFORE UPDATE que deixam os valores positivos
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
