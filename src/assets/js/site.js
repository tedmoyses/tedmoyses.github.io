document.getElementById('navToggle').addEventListener('click', function () {
  const links = document.getElementById('navLinks');
  const expanded = this.getAttribute('aria-expanded') === 'true';
  links.classList.toggle('show');
  this.setAttribute('aria-expanded', !expanded);
});
