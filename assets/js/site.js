// grab active links and set them
document
  .querySelectorAll('a[href="' + location.pathname + '"]')
  .forEach(item => item.classList.add('active'))

document.getElementById('menu-icon').addEventListener('click', function () {
  const nav = document.getElementsByTagName('nav')[0]
  console.log('clicked')
  nav.classList.toggle('show')
})
