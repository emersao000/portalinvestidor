-- =============================================================
--  PORTAL DO INVESTIDOR - EVOQUE ACADEMIA
--  Script de criação das tabelas
--
--  Banco de dados: portal-investidor (Azure MySQL)
--
--  INSTRUÇÕES:
--  1. Abra o MySQL Workbench e conecte ao servidor Azure
--  2. No menu superior: File > Open SQL Script > selecione este arquivo
--  3. Certifique-se de selecionar o banco correto antes de executar:
--     clique duas vezes em "portal-investidor" no painel Schemas
--  4. Execute com Ctrl+Shift+Enter (executar tudo)
--
--  OBSERVAÇÃO: este script usa apenas CREATE TABLE / INDEX / INSERT.
--  Nenhum comando de DDL privilegiado (GRANT, CREATE USER, etc.)
--  é necessário. Funciona com usuário padrão do Azure MySQL Flexible.
-- =============================================================

-- Garante que estamos no banco certo
USE `portal-investidor`;

-- =============================================================
--  CONFIGURAÇÕES DE SESSÃO
-- =============================================================
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;   -- desativa checagem durante criação

-- =============================================================
--  1. TABELA: units  (Unidades / academias)
-- =============================================================
CREATE TABLE IF NOT EXISTS `units` (
    `id`            INT            NOT NULL AUTO_INCREMENT,
    `nome`          VARCHAR(150)   NOT NULL,
    `endereco`      VARCHAR(255)   NOT NULL DEFAULT '',
    `cidade`        VARCHAR(120)   NOT NULL DEFAULT '',
    `estado`        VARCHAR(2)     NOT NULL DEFAULT '',
    `cep`           VARCHAR(20)    NOT NULL DEFAULT '',
    `status_texto`  VARCHAR(100)   NOT NULL DEFAULT 'Unidade inaugurada',
    `foto_url`      VARCHAR(255)   NOT NULL DEFAULT '',
    `created_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_units_nome` (`nome`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
--  2. TABELA: users  (Investidores e admins)
-- =============================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id`                    INT            NOT NULL AUTO_INCREMENT,
    `nome`                  VARCHAR(150)   NOT NULL,
    `sobrenome`             VARCHAR(150)       NULL,
    `cpf`                   VARCHAR(14)        NULL,
    `email`                 VARCHAR(255)   NOT NULL,
    `telefone`              VARCHAR(30)        NULL,
    `password_hash`         VARCHAR(255)   NOT NULL,
    `role`                  VARCHAR(20)    NOT NULL DEFAULT 'investor',
    `is_active`             TINYINT        NOT NULL DEFAULT 1,
    `is_authorized`         TINYINT        NOT NULL DEFAULT 0,
    `must_change_password`  TINYINT        NOT NULL DEFAULT 0,
    `created_at`            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    UNIQUE KEY `uq_users_cpf`   (`cpf`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Índices auxiliares já cobertos pelas UNIQUE KEY declaradas na tabela acima.
-- (ix_users_email e ix_users_cpf são redundantes com uq_users_email/uq_users_cpf no MySQL)

-- =============================================================
--  3. TABELA: user_units  (Permissões: qual investidor acessa qual unidade)
-- =============================================================
CREATE TABLE IF NOT EXISTS `user_units` (
    `id`       INT  NOT NULL AUTO_INCREMENT,
    `user_id`  INT  NOT NULL,
    `unit_id`  INT  NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_unit` (`user_id`, `unit_id`),

    CONSTRAINT `fk_user_units_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_user_units_unit`
        FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
--  4. TABELA: files  (PDFs / documentos enviados pelo admin)
-- =============================================================
CREATE TABLE IF NOT EXISTS `files` (
    `id`               INT           NOT NULL AUTO_INCREMENT,
    `titulo`           VARCHAR(255)  NOT NULL,
    `nome_arquivo`     VARCHAR(255)  NOT NULL,
    `caminho_arquivo`  VARCHAR(255)  NOT NULL,
    `tipo_arquivo`     VARCHAR(100)  NOT NULL DEFAULT 'DRE',
    `mes_referencia`   VARCHAR(40)   NOT NULL DEFAULT '',
    `ano_referencia`   INT           NOT NULL DEFAULT 2026,
    `uploaded_by`      INT               NULL,
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    CONSTRAINT `fk_files_uploaded_by`
        FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
--  5. TABELA: file_units  (Permissões: qual PDF é visível para qual unidade)
-- =============================================================
CREATE TABLE IF NOT EXISTS `file_units` (
    `id`       INT  NOT NULL AUTO_INCREMENT,
    `file_id`  INT  NOT NULL,
    `unit_id`  INT  NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_file_unit` (`file_id`, `unit_id`),

    CONSTRAINT `fk_file_units_file`
        FOREIGN KEY (`file_id`) REFERENCES `files` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_file_units_unit`
        FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
--  Reativa checagem de chaves estrangeiras
-- =============================================================
SET foreign_key_checks = 1;

-- =============================================================
--  USUÁRIO ADMIN INICIAL
--
--  Login: admin@evoque.com.br
--  Senha: Evoque@2026  (já hasheada com bcrypt abaixo)
--
--  TROQUE A SENHA NO PRIMEIRO LOGIN pelo painel de admin.
--  Para gerar um novo hash, rode no terminal Python:
--    python -c "from passlib.context import CryptContext; \
--               ctx = CryptContext(schemes=['bcrypt']); \
--               print(ctx.hash('SuaSenhaAqui'))"
-- =============================================================
INSERT IGNORE INTO `users`
    (`nome`, `sobrenome`, `email`, `password_hash`, `role`, `is_active`, `is_authorized`, `must_change_password`)
VALUES
    (
        'Admin',
        'Evoque',
        'admin@evoque.com.br',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSm6E8maodZGMiHkamO',  -- Evoque@2026
        'admin',
        1,
        1,
        1   -- força troca de senha no primeiro acesso
    );

-- =============================================================
--  VERIFICAÇÃO FINAL
--  Execute este SELECT para confirmar que as tabelas foram criadas
-- =============================================================
SELECT
    table_name          AS `Tabela`,
    table_rows          AS `Registros (estimado)`,
    engine              AS `Engine`,
    table_collation     AS `Collation`
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY table_name;
