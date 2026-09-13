<?php
// Desenvolvimento Web Avancada: template com barra de status, modal de confirmacao, toast e scripts
// A pagina define $fonte e $script antes do include.
?>
    </main>
  </div>
</div>

<footer class="dw-status">
  <?php if ($pagina === 'dashboard'): ?>
    <span class="dw-status-item"><b>Período</b> <span id="carimbo-periodo">&mdash;</span></span>
  <?php endif; ?>
  <span class="dw-status-item"><b>Fonte</b> <span><?= htmlspecialchars($fonte) ?></span></span>
  <span class="dw-status-item"><b>Leitura</b> <span id="carimbo-atualizacao">--:--:--</span></span>
  <span class="dw-status-marca">DW Engenharia Elétrica</span>
</footer>

<div class="modal fade" id="modal-confirmar" tabindex="-1" aria-labelledby="titulo-confirmar" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content dw-modal">
      <div class="modal-header">
        <h2 class="modal-title dw-modal-titulo" id="titulo-confirmar">Confirmar exclusão</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <p id="texto-confirmar" class="mb-0"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sm dw-btn-secundario" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-sm btn-danger" id="btn-confirmar">Excluir</button>
      </div>
    </div>
  </div>
</div>

<div class="toast-container position-fixed dw-toasts">
  <div id="toast-mensagem" class="toast dw-toast" role="status" aria-live="polite" aria-atomic="true">
    <div class="toast-body d-flex align-items-start gap-2">
      <span id="texto-toast" class="flex-grow-1"></span>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script type="module" src="../js/<?= $script ?>.js"></script>

</body>
</html>
