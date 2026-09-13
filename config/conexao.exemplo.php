<?php

declare(strict_types=1);

// Tech Forge: conexao PDO com o MySQL do XAMPP

const DB_HOST  = 'localhost';
const DB_NOME  = 'projeto_3dw';
const DB_USER  = 'root';
const DB_SENHA = '';

function conectar(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_NOME
    );

    $pdo = new PDO($dsn, DB_USER, DB_SENHA, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}
