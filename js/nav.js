//NAVEGACION DEL MENU
function ocultarTodas() {
  var pags = document.querySelectorAll('.pag');
  pags.forEach((pag, i) => {
    pag.style.display = 'none';
  });
}

function irAPagina(pagina) {
  ocultarTodas();
  var pagInicio = document.querySelector('#pag-' + pagina);
  pagInicio.style.display = 'block';
  document.querySelector('.menu_principal').classList.add('oculto-movil');
}

function irAInicio() {
  irAPagina('inicio');

}

async function irARestaurantes() {
  irAPagina('restaurantes');
    await mostrarRestaurantes();
}

async function irARestaurante(id) {
  irAPagina('restaurantes');
    await mostrarUno(id);
}

function irAHistoria() {
  irAPagina('historia');
}

function irAContacto() {
  irAPagina('contacto');
}

function irAIniciarSesion() {
  irAPagina('iniciarsesion');
}

function mostrarMenu(ev) {
  ev.preventDefault();
  document.querySelector('.menu_principal').classList.remove('oculto-movil');
}
