<?php
$pagina     = 'dashboard';
$titulo     = 'Materiais aplicados';
$subtitulo  = 'Consumo de material por obra, lançamento a lançamento.';
$botaoId    = 'btn-atualizar';
$botaoTexto = 'Atualizar dados';
$fonte      = 'sp_dashboard_lancamentos';
$script     = 'dashboard';

require __DIR__ . '/../includes/cabecalho.php';
?>

      <!-- Tech Forge: layout da dashboard em faixas (filtros, totais, blocos e tabela) -->
      <form id="form-filtros" class="card dw-card dw-filtros" novalidate>
        <div class="row g-2 align-items-end">
          <div class="col-6 col-md-3 col-xl-2">
            <label for="filtro-inicio" class="form-label dw-rotulo">De</label>
            <input type="date" id="filtro-inicio" class="form-control form-control-sm">
          </div>
          <div class="col-6 col-md-3 col-xl-2">
            <label for="filtro-fim" class="form-label dw-rotulo">Até</label>
            <input type="date" id="filtro-fim" class="form-control form-control-sm">
          </div>
          <div class="col-12 col-md-3 col-xl-3">
            <label for="filtro-categoria" class="form-label dw-rotulo">Categoria</label>
            <select id="filtro-categoria" class="form-select form-select-sm">
              <option value="">Todas as categorias</option>
            </select>
          </div>
          <div class="col-12 col-md-3 col-xl-auto d-flex gap-2">
            <button type="submit" class="btn btn-sm dw-btn-atualizar">Aplicar</button>
            <button type="button" id="btn-limpar" class="btn btn-sm dw-btn-secundario">Limpar</button>
          </div>
        </div>
      </form>

      <div id="bloco-carregando" class="dw-estado" role="status">
        <div class="spinner-border dw-spinner" aria-hidden="true"></div>
        <p class="dw-estado-txt">Consultando o banco de dados...</p>
      </div>

      <div id="bloco-erro" class="alert dw-alerta dw-alerta--erro d-none" role="alert">
        <h2 class="dw-alerta-titulo">O painel não conseguiu ler o banco</h2>
        <p id="texto-erro" class="dw-alerta-txt"></p>
        <p class="dw-alerta-dica">
          Confirme que o Apache e o MySQL estão iniciados no XAMPP e que o
          banco configurado em <code>config/conexao.php</code> foi importado.
        </p>
      </div>

      <!-- Logica Avancada: mensagem para banco vazio ou filtro sem resultado -->
      <div id="bloco-vazio" class="alert dw-alerta dw-alerta--vazio d-none" role="status">
        <h2 class="dw-alerta-titulo">Nenhum dado registrado</h2>
        <p class="dw-alerta-txt">
          A conexão com o banco funcionou, mas não há material lançado para o
          período e a categoria escolhidos.
        </p>
        <p class="dw-alerta-dica">
          Clique em Limpar para ver tudo. Se continuar vazio, importe <code>sql/02_seed.sql</code>.
        </p>
      </div>

      <div id="bloco-conteudo" class="d-none">

        <section class="card dw-card dw-totais" aria-labelledby="titulo-totais">
          <h2 id="titulo-totais" class="visually-hidden">Totais do período</h2>

          <div class="row g-0">
            <div class="col-12 col-md-6 col-xl-3 dw-total">
              <p class="dw-total-rotulo">Total aplicado</p>
              <p class="dw-total-valor" id="kpi-total">&mdash;</p>
              <p class="dw-total-sub" id="kpi-total-sub">&mdash;</p>
            </div>
            <div class="col-12 col-md-6 col-xl-3 dw-total">
              <p class="dw-total-rotulo">Volume aplicado</p>
              <p class="dw-total-valor" id="kpi-itens">&mdash;</p>
              <p class="dw-total-sub" id="kpi-itens-sub">&mdash;</p>
            </div>
            <div class="col-12 col-md-6 col-xl-3 dw-total">
              <p class="dw-total-rotulo">Média por lançamento</p>
              <p class="dw-total-valor" id="kpi-ticket">&mdash;</p>
              <p class="dw-total-sub" id="kpi-ticket-sub">&mdash;</p>
            </div>
            <div class="col-12 col-md-6 col-xl-3 dw-total">
              <p class="dw-total-rotulo">Estoque crítico</p>
              <p class="dw-total-valor" id="kpi-criticos">&mdash;</p>
              <p class="dw-total-sub" id="kpi-criticos-sub">&mdash;</p>
            </div>
          </div>
        </section>

        <div class="row g-3 dw-blocos">
          <section class="col-12 col-xl-4">
            <div class="card dw-card h-100">
              <header class="dw-relacao-topo">
                <h2 class="dw-relacao-titulo">Destaques</h2>
                <p class="dw-relacao-nota">Maiores do filtro</p>
              </header>
              <dl class="dw-destaques">
                <div class="dw-destaque">
                  <dt>Material mais lançado</dt>
                  <dd id="destaque-material">&mdash;</dd>
                  <dd class="dw-destaque-sub" id="destaque-material-sub">&mdash;</dd>
                </div>
                <div class="dw-destaque">
                  <dt>Obra de maior consumo</dt>
                  <dd id="destaque-obra">&mdash;</dd>
                  <dd class="dw-destaque-sub" id="destaque-obra-sub">&mdash;</dd>
                </div>
                <div class="dw-destaque">
                  <dt>Cliente com mais lançamentos</dt>
                  <dd id="destaque-cliente">&mdash;</dd>
                  <dd class="dw-destaque-sub" id="destaque-cliente-sub">&mdash;</dd>
                </div>
              </dl>
            </div>
          </section>

          <section class="col-12 col-md-6 col-xl-4">
            <div class="card dw-card h-100">
              <header class="dw-relacao-topo">
                <h2 class="dw-relacao-titulo">Total por categoria</h2>
                <p class="dw-relacao-nota">Valor aplicado</p>
              </header>
              <ul id="lista-categorias" class="dw-barras"></ul>
            </div>
          </section>

          <section class="col-12 col-md-6 col-xl-4">
            <div class="card dw-card h-100">
              <header class="dw-relacao-topo">
                <h2 class="dw-relacao-titulo">Estoque crítico</h2>
                <p class="dw-relacao-nota">Saldo / mínimo</p>
              </header>
              <ul id="lista-criticos" class="dw-criticos"></ul>
            </div>
          </section>
        </div>
      </div>

      <section class="card dw-card dw-relacao">
        <header class="dw-relacao-topo">
          <h2 class="dw-relacao-titulo">Lançamentos</h2>
          <form id="form-busca" class="dw-busca" role="search">
            <label for="campo-busca" class="visually-hidden">Buscar lançamento</label>
            <input type="search" id="campo-busca" class="form-control form-control-sm"
                   placeholder="Material, obra ou cliente">
            <button type="submit" class="btn btn-sm dw-btn-secundario">Buscar</button>
          </form>
        </header>

        <div class="table-responsive" tabindex="0" role="region"
             aria-label="Relação de lançamentos">
          <table class="table table-hover align-middle dw-tabela mb-0">
            <caption class="visually-hidden">
              Material aplicado em obra, com quantidade, valor total e
              situação do saldo em almoxarifado.
            </caption>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Material</th>
                <th scope="col">Obra</th>
                <th scope="col" class="text-end">Quantidade</th>
                <th scope="col" class="text-end">Total</th>
                <th scope="col" class="text-end">Estoque</th>
              </tr>
            </thead>
            <tbody id="corpo-tabela"></tbody>
          </table>
        </div>

        <footer class="dw-relacao-rodape d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <span id="rodape-tabela">&mdash;</span>
          <nav aria-label="Páginas de lançamentos">
            <ul id="paginacao" class="pagination pagination-sm dw-paginacao mb-0"></ul>
          </nav>
        </footer>
      </section>

<?php require __DIR__ . '/../includes/rodape.php'; ?>
