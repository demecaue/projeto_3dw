<?php
// Desenvolvimento Web Avancada: template com head, menu e cabecalho usado por todas as paginas
// A pagina define $pagina, $titulo, $subtitulo, $botaoId e $botaoTexto antes do include.

$menu = [
    'dashboard' => ['Painel', 'dashboard.php'],
    'obras'     => ['Obras', 'obras.php'],
    'materiais' => ['Materiais', 'materiais.php'],
    'clientes'  => ['Clientes', 'clientes.php'],
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($titulo) ?> &middot; DW Obras</title>

<link rel="icon" href="../assets/img/dw-emblema.png">

<!-- Desenvolvimento Web Avancada: Bootstrap 5 (navbar, card, table, form, modal, toast, pagination, badge, alert) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<link href="../assets/css/estilo.css" rel="stylesheet">
</head>
<body>

<div class="dw-app">

  <nav class="navbar navbar-expand-lg navbar-dark flex-lg-column dw-rail">

    <a class="navbar-brand dw-marca" href="dashboard.php">
      <img src="../assets/img/dw-emblema.png" alt="">
      <span class="dw-marca-txt">
        <span class="dw-marca-nome">DW Obras</span>
        <span class="dw-marca-sub">Engenharia Elétrica</span>
      </span>
    </a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#menu" aria-controls="menu"
            aria-expanded="false" aria-label="Abrir menu">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse flex-lg-column align-items-lg-stretch w-100" id="menu">
      <ul class="navbar-nav flex-lg-column w-100">
        <?php foreach ($menu as $chave => [$rotulo, $link]): ?>
          <li class="nav-item">
            <?php if ($chave === $pagina): ?>
              <a class="nav-link active" aria-current="page" href="<?= $link ?>"><?= $rotulo ?></a>
            <?php else: ?>
              <a class="nav-link" href="<?= $link ?>"><?= $rotulo ?></a>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>

      <span class="dw-contexto">Almoxarifado central</span>
    </div>
  </nav>

  <div class="dw-corpo">

    <header class="dw-cabecalho">
      <div>
        <h1 class="dw-titulo"><?= htmlspecialchars($titulo) ?></h1>
        <p class="dw-subtitulo"><?= htmlspecialchars($subtitulo) ?></p>
      </div>

      <button id="<?= $botaoId ?>" type="button" class="btn dw-btn-atualizar">
        <?= htmlspecialchars($botaoTexto) ?>
      </button>
    </header>

    <main class="dw-main">
