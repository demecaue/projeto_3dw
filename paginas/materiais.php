<?php
$pagina     = 'materiais';
$titulo     = 'Materiais';
$subtitulo  = 'Cadastro e saldo do almoxarifado.';
$botaoId    = 'btn-novo';
$botaoTexto = 'Novo material';
$fonte      = 'fn_situacao_estoque';
$script     = 'materiais';

require __DIR__ . '/../includes/cabecalho.php';
?>

      <div id="bloco-carregando" class="dw-estado" role="status">
        <div class="spinner-border dw-spinner" aria-hidden="true"></div>
        <p class="dw-estado-txt">Consultando o banco de dados...</p>
      </div>

      <div id="bloco-erro" class="alert dw-alerta dw-alerta--erro d-none" role="alert">
        <h2 class="dw-alerta-titulo">Não foi possível carregar os materiais</h2>
        <p id="texto-erro" class="dw-alerta-txt"></p>
        <p class="dw-alerta-dica">Confirme que o Apache e o MySQL estão iniciados no XAMPP.</p>
      </div>

      <section id="bloco-lista" class="card dw-card dw-relacao dw-relacao--topo d-none">
        <header class="dw-relacao-topo">
          <h2 class="dw-relacao-titulo">Materiais cadastrados</h2>
          <p class="dw-relacao-nota">Material já lançado em obra não pode ser excluído</p>
        </header>

        <div class="table-responsive">
          <table class="table table-hover align-middle dw-tabela dw-tabela--crud mb-0">
            <thead>
              <tr>
                <th scope="col">Material</th>
                <th scope="col" class="text-end">Valor unitário</th>
                <th scope="col" class="text-end">Estoque</th>
                <th scope="col" class="text-end">Lançamentos</th>
                <th scope="col" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody id="corpo-tabela"></tbody>
          </table>
        </div>

        <footer class="dw-relacao-rodape">
          <span id="rodape-tabela">&mdash;</span>
        </footer>
      </section>

      <div class="modal fade" id="modal-form" tabindex="-1" aria-labelledby="titulo-form" aria-hidden="true">
        <div class="modal-dialog">
          <form id="form-registro" class="modal-content dw-modal" novalidate>
            <div class="modal-header">
              <h2 class="modal-title dw-modal-titulo" id="titulo-form">Novo material</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <div id="form-erro" class="alert alert-danger py-2 d-none" role="alert"></div>
              <div class="mb-3">
                <label for="campo-nome" class="form-label dw-rotulo">Nome</label>
                <input type="text" id="campo-nome" class="form-control" maxlength="120" required>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-8">
                  <label for="campo-categoria" class="form-label dw-rotulo">Categoria</label>
                  <select id="campo-categoria" class="form-select" required>
                    <option value="">Escolha a categoria</option>
                  </select>
                </div>
                <div class="col-4">
                  <label for="campo-unidade" class="form-label dw-rotulo">Unidade</label>
                  <input type="text" id="campo-unidade" class="form-control" maxlength="10" placeholder="un, m, br" required>
                </div>
              </div>
              <div class="row g-3">
                <div class="col-4">
                  <label for="campo-valor" class="form-label dw-rotulo">Valor (R$)</label>
                  <input type="number" id="campo-valor" class="form-control" min="0.01" step="0.01" required>
                </div>
                <div class="col-4">
                  <label for="campo-estoque" class="form-label dw-rotulo">Estoque</label>
                  <input type="number" id="campo-estoque" class="form-control" min="0" step="1" required>
                </div>
                <div class="col-4">
                  <label for="campo-minimo" class="form-label dw-rotulo">Mínimo</label>
                  <input type="number" id="campo-minimo" class="form-control" min="0" step="1" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm dw-btn-secundario" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-sm dw-btn-atualizar">Salvar</button>
            </div>
          </form>
        </div>
      </div>

<?php require __DIR__ . '/../includes/rodape.php'; ?>
