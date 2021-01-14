<html>
  <head>
    <title><?= $page->title ?></title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <link rel="stylesheet" href="<?= $assets ?>main.css"/>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
    </nav>
    <?php include $page->body; ?>
  </body>
</html>