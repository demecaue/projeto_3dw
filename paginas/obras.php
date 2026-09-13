<?php
$pagina     = 'obras';
$titulo     = 'Obras';
$subtitulo  = 'Serviços em andamento e histórico de consumo por obra.';
$botaoId    = 'btn-novo';
$botaoTexto = 'Nova obra';
$fonte      = 'vw_resumo_obras';
$script     = 'obras';

require __DIR__ . '/../includes/cabecalho.php';
?>

      <div id="bloco-carregando" class="dw-estado" role="status">
        <div class="spinner-border dw-spinner" aria-hidden="true"></div>
        <p class="dw-estado-txt">Consultando o banco de dados...</p>
      </div>

      <div id="bloco-erro" class="alert dw-alerta dw-alerta--erro d-none" role="alert">
        <h2 class="dw-alerta-titulo">Não foi possível carregar as obras</h2>
        <p id="texto-erro" class="dw-alerta-txt"></p>
        <p class="dw-alerta-dica">Confirme que o Apache e o MySQL estão iniciados no XAMPP.</p>
      </div>

      <section id="bloco-lista" class="card dw-card dw-relacao dw-relacao--topo d-none">
        <header class="dw-relacao-topo">
          <h2 class="dw-relacao-titulo">Obras cadastradas</h2>
          <p class="dw-relacao-nota">Obra com lançamento de material não pode ser excluída</p>
        </header>

        <div class="table-responsive">
          <table class="table table-hover align-middle dw-tabela dw-tabela--crud mb-0">
            <thead>
              <tr>
                <th scope="col">Início</th>
                <th scope="col">Obra</th>
                <th scope="col">Situação</th>
                <th scope="col" class="text-end">Lançamentos</th>
                <th scope="col" class="text-end">Total aplicado</th>
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
              <h2 class="modal-title dw-modal-titulo" id="titulo-form">Nova obra</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <div id="form-erro" class="alert alert-danger py-2 d-none" role="alert"></div>
              <div class="mb-3">
                <label for="campo-titulo" class="form-label dw-rotulo">Título</label>
                <input type="text" id="campo-titulo" class="form-control" maxlength="140" required>
              </div>
              <div class="mb-3">
                <label for="campo-cliente" class="form-label dw-rotulo">Cliente</label>
                <select id="campo-cliente" class="form-select" required>
                  <option value="">Escolha o cliente</option>
                </select>
              </div>
              <div class="row g-3">
                <div class="col-6">
                  <label for="campo-status" class="form-label dw-rotulo">Situação</label>
                  <select id="campo-status" class="form-select">
                    <option value="EM_ANDAMENTO">Em andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="PARALISADA">Paralisada</option>
                  </select>
                </div>
                <div class="col-6">
                  <label for="campo-data" class="form-label dw-rotulo">Início</label>
                  <input type="date" id="campo-data" class="form-control" required>
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
