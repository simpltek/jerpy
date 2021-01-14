<?php

define('PAGES', './pages/meta.json');
define('THEME', 'default');

$keys = array_keys($_GET);
$path = count($keys) == 1 ? $keys[0] : '';
$pages = json_decode(file_get_contents(PAGES));

$page = null;
foreach ($pages as $p) {
  if($p->path == $path) {
    $page = $p;
    break;
  }
}

$theme = './themes/'.THEME;
$template = $theme.'/index.php';
$assets = $theme.'/';

if($page) {
  $page->body = './pages/'.$page->file;
} else {
  $page->title = 'Page Not Found';
  $page->body = './pages/404.htm';
}

include $template;

?>