<!doctype html>
<html lang="es">

<head>
  <meta charset="utf-8">
  
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
  
  <meta name="csrf-token" content="{{ csrf_token() }}">
  @viteReactRefresh
  @vite('resources/js/app.jsx')
  @inertiaHead
  <title>ANF</title>
</head>

<body>
  @inertia
</body>

</html>