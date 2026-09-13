<?php
$pagina     = 'clientes';
$titulo     = 'Clientes';
$subtitulo  = 'Unidades atendidas pela DW Engenharia Elétrica.';
$botaoId    = 'btn-novo';
$botaoTexto = 'Novo cliente';
$fonte      = 'cliente';
$script     = 'clientes';

require __DIR__ . '/../includes/cabecalho.php';
?>

      <div id="bloco-carregando" class="dw-estado" role="status">
        <div class="spinner-border dw-spinner" aria-hidden="true"></div>
        <p class="dw-estado-txt">Consultando o banco de dados...</p>
      </div>

      <div id="bloco-erro" class="alert dw-alerta dw-alerta--erro d-none" role="alert">
        <h2 class="dw-alerta-titulo">Não foi possível carregar os clientes</h2>
        <p id="texto-erro" class="dw-alerta-txt"></p>
        <p class="dw-alerta-dica">Confirme que o Apache e o MySQL estão iniciados no XAMPP.</p>
      </div>

      <section id="bloco-lista" class="card dw-card dw-relacao dw-relacao--topo d-none">
        <header class="dw-relacao-topo">
          <h2 class="dw-relacao-titulo">Clientes cadastrados</h2>
          <p class="dw-relacao-nota">Cliente com obra não pode ser excluído</p>
        </header>

        <div class="table-responsive">
          <table class="table table-hover align-middle dw-tabela dw-tabela--crud mb-0">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Cidade</th>
                <th scope="col" class="text-end">Obras</th>
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
              <h2 class="modal-title dw-modal-titulo" id="titulo-form">Novo cliente</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <div id="form-erro" class="alert alert-danger py-2 d-none" role="alert"></div>
              <div class="mb-3">
                <label for="campo-nome" class="form-label dw-rotulo">Nome</label>
                <input type="text" id="campo-nome" class="form-control" maxlength="120" required>
              </div>
              <div>
                <label for="campo-cidade" class="form-label dw-rotulo">Cidade</label>
                <input type="text" id="campo-cidade" class="form-control" maxlength="80" required>
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
