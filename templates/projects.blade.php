
@extends('layout')
@section('title', 'Welcome')
@section('content')

<h2>Projects</h2>

<p>Here i have listed some of the side projects i am working on and perhaps some ideas for future projects to. These are almost exclusively used as learning exercises but some may see production use</p>

<h3>Glomr</h3>
<p>
<section><a href="https://github.com/TedMoyses/Glomr-tool">Github</a></section>
Glomr is a static site builder in PHP that uses Blade templates from Laravel and features an asset pipeline that aggregates and compresses assets and allows for arbitrary complex site structures.
Glomr is based on a library <a hre="https://github.com/TedMoyses/glomr-lib">glomr-lib</a> that can be extended to build many types of content in to static HTML</p>
</p>

<h3>Paper plane</h3>
<p>
<section>Coming soon!</section>
This is a design for a paper aircraft to print on A4 card and assemble with glue. I was inspired to re-create an interpretation of some high performance paper aircraft i had success with when i was young. The file was produced in <a href="https://freecadweb.org">FreeCAD</a> and the freecad file as well as an SVG will be produced for anyone who wants to print on good quality modelling card, build and fly!
</p>

<h3>Charbohydrate</h3>
<p>
  <section>Coming soon!</section>
  This was initially conceived as a tool for writing story characters and visualising events and timelines. An experiment in event data visualisation in a useful context
</p>

<h3>Questr</h3>
<p>
  <section>Coming soon!</section>
  This started as a requirement for gathering information from a user in a browser and posting it to a destination. It has since sprawled in to an abstract schema for asking questions and collecting answers that can be integrated as a third party widget/component.
</p>

@endsection
