<?php

session_start();

define('PASSWORD','admin');

$method = $_SERVER['REQUEST_METHOD'];
$keys = array_keys($_GET);
$path = count($keys) > 0 ? $keys[0] : '';
$body = json_decode(file_get_contents('php://input'));

function json($obj) {
  header('Content-Type: application/json');
  echo json_encode($obj);
  exit;
}

if($method == 'POST') {
  if($path == 'login') {
    $pass = $_POST['password'];
    if($pass == PASSWORD) {
      $_SESSION['user'] = 'admin';
	    header('Location: ./backend.php');
	    exit;
    }
  } elseif($path == 'save-meta') {
    $page = fopen('./pages/meta.json', 'w');
    fwrite($page, json_encode($body));
    json(array('msg'=>'Saved meta'));
  } elseif($path == 'save-page') {
    $page = fopen('./pages/'.$body->name, 'w');
    fwrite($page, $body->data);
    json(array('msg'=>'Saved page'));
  } elseif($path == 'save-file') {
    $file = fopen($body->name, 'w');
    fwrite($file, $body->data);
    json(array('msg'=>'Saved file'));
  } elseif($path == 'new-page-file') {
    fopen('./pages/'.$body->name, 'w');
    json(array('msg'=>'Created new page file'));
  }
} elseif($method == 'GET') {
  if($path == 'get-theme-files') {
    $files = glob('./themes/default/*');
    foreach($files as &$file) {
      $file = array(
        'name'=>basename($file),
        'path'=>$file
      );
    }
    json($files);
  } elseif($path == 'get-file') {
    $file = $_GET['path'];
    json(array('data'=>file_get_contents($file)));
  } elseif($path == 'logout') {
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    header('Location: ./backend.php');
    exit;
  }
} elseif($method == 'DELETE') {
  if($path == 'delete-page') {
    $file = './pages/'.$body->file;
    unlink($file);
    json(array('msg'=>'Deleted page'));
  }
}

?>

<html>
  <head>
    <title>Jerpy</title>
    <link rel="icon" href="#"/>
    <link rel="stylesheet" href="bootstrap.min.css"/>
    <link rel="stylesheet" href="backend.css"/>
  </head>
  <body>
    <?php if(isset($_SESSION['user'])) { ?>
    <div id="app"></div>
    <script src="vue.min.js"></script>
    <script src="backend.js"></script>
    <?php } else { ?>
    <div class="container p-5">
	  <h1 class="mx-auto my-5 text-center">Jerpy</h1>
      <div class="card card-body w-25 mx-auto">
        <form method="POST" action="?login">
          <h4 class="card-title mb-2">Login</h4>
          <input class="form-control mb-3" name="password" placeholder="Password" type="password"/>
          <button class="btn btn-primary" type="submit">Login</button>
        </form>
      </div>
    </div>
    <?php } ?>
  </body>
</html>