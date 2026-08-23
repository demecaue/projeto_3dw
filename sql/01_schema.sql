DROP DATABASE IF EXISTS projeto_3dw;
CREATE DATABASE projeto_3dw
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE projeto_3dw;

CREATE TABLE categoria (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    nome  VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cliente (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nome    VARCHAR(120) NOT NULL,
    cidade  VARCHAR(80)  NOT NULL
) ENGINE=InnoDB;

CREATE TABLE obra (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id   INT NOT NULL,
    titulo       VARCHAR(140) NOT NULL,
    status       ENUM('EM_ANDAMENTO','CONCLUIDA','PARALISADA')
                 NOT NULL DEFAULT 'EM_ANDAMENTO',
    data_inicio  DATE NOT NULL,
    CONSTRAINT fk_obra_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE material (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id    INT NOT NULL,
    nome            VARCHAR(120)   NOT NULL,
    unidade         VARCHAR(10)    NOT NULL,
    valor_unitario  DECIMAL(10,2)  NOT NULL,
    estoque_atual   INT            NOT NULL DEFAULT 0,
    estoque_minimo  INT            NOT NULL DEFAULT 0,
    CONSTRAINT fk_material_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE aplicacao_material (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    obra_id         INT NOT NULL,
    material_id     INT NOT NULL,
    quantidade      DECIMAL(10,2) NOT NULL,
    valor_unitario  DECIMAL(10,2) NOT NULL,
    data_aplicacao  DATE NOT NULL,
    CONSTRAINT fk_aplicacao_obra
        FOREIGN KEY (obra_id) REFERENCES obra(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_aplicacao_material
        FOREIGN KEY (material_id) REFERENCES material(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_aplicacao_data ON aplicacao_material (data_aplicacao);
