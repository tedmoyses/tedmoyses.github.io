<html>
  <head>
    <title>Ted Moyses - @yield('title')</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Oswald|Roboto+Condensed" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/site.css" />
    <style>
      @yield('pagecss')
    </style>
  </head>
  <body>
    @include('nav')
    <div class="container">
      @yield('content')
    </div>
    <script src="/assets/js/site.js" ></script>
  </body>
</html>
