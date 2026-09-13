-- Rodar como root depois dos arquivos 01, 02 e 03.
-- O DROP DATABASE do 01 apaga os privilegios, entao o GRANT precisa ser refeito.
-- Troque 'caue' pelo usuario usado em config/conexao.php.
-- EXECUTE e necessario para a API chamar as procedures e a funcao.
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON projeto_3dw.* TO 'caue'@'localhost';
FLUSH PRIVILEGES;
