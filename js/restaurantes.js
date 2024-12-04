
var restaurantes = [];
async function cargarRestaurantes() {
  const snapshot = await database.collection('restaurantes').get();
  restaurantes = [];
  snapshot.forEach(async function(doc) {
    const restaurante = doc.data()
    restaurante._id = doc.id
    restaurantes.push(restaurante);
  });
}

async function mostrarRestaurante(restaurante) {
  // Aquí puedes hacer algo con cada restaurante, como agregarlo a tu página HTML
  var nombre = restaurante.nombre;
  var direccion = restaurante.ubicacion + ' (' + restaurante.localidad + ')';
  var telefono = restaurante.Telefono;
  var estrellas = restaurante.puntos / restaurante.votos;
  var imagenesEstrellas = '';
  var contEstrella = 0;
  while (contEstrella < estrellas) {
    imagenesEstrellas += '<img src="img/estrella.png" style="width: 20px; height: 20px">';
    contEstrella++;
  }
  var refImagen = await storage.refFromURL(restaurante.imagen).getDownloadURL();
  console.log(refImagen);
  // Agregar el restaurante a tu página HTML
  var restauranteElemento = document.createElement('div');
  var html = `
    <div class="contenedor-restaurante diseñolistarestaurante" >
      <img src="${refImagen}">
      <div id="restaurante-info">
        <h2 id="titulo_Restaurante">
          <a href="#" onclick="mostrarUno('${restaurante._id}', event);" >
            ${nombre}
          </a>
        </h2>
        <p>
          <img src="img/mapas-de-google.gif" style="width: 40px; height: 40px">
          Dirección: ${direccion}
        </p>
        <p>
          <img src="img/llamada-telefonica.gif" style="width: 40px; height: 40px">
          Teléfono: ${telefono}
        </p>
        <p>
          <img src="img/clasificacion.gif" style="width: 40px; height: 40px">
          Votos antiguos clientes: ${imagenesEstrellas}
        </p>
        <button onclick="mostrarUno('${restaurante._id}', event);">Conocer restaurante </button>
      </div>
    </div>
  `;
  restauranteElemento.innerHTML = html;
  document.getElementById('lista-restaurantes').appendChild(restauranteElemento);
}
var pagina = 0;
/*mostrar todos los restaurantes*/
async function mostrarRestaurantes() {
  document.getElementById('lista-restaurantes').innerHTML = '';
  const user = auth.currentUser;
  let localidad = false;
  if (user) {
    const snapshot = await database.collection('usuarios')
      .where('email', '==', user.email)
      .get();
    snapshot.forEach(doc => {
        localidad = doc.data().localidad.toLowerCase();
    });
  }
  if (localidad) {
    restaurantes = [...restaurantes];
    restaurantes.sort((r1, r2) => {
      if (r1.localidad.toLowerCase() == localidad && r2.localidad.toLowerCase() != localidad) return -1;
      if (r1.localidad.toLowerCase() != localidad && r2.localidad.toLowerCase() == localidad) return 1;
      return r1.nombre.localeCompare(r2.nombre);
    });
  }
  for (var i = 0; i < restaurantes.length; i++) {
    if (i >= pagina*5 && i < (pagina+1)*5) {
      await mostrarRestaurante(restaurantes[i]);
    }
  }

  const paginas = document.createElement('div');
  paginas.innerHTML = '<a href="#" id="boton-anterior" onclick="paginaAnterior()">Anterior</a> <a href="#" id="boton-siguiente" onclick="paginaSiguiente()">Siguiente</a>'
  document.getElementById('lista-restaurantes').appendChild(paginas);
}

function paginaAnterior() {
  if (pagina == 0) return;
  pagina--;
  mostrarRestaurantes();
}

function paginaSiguiente() {
  pagina++;
  mostrarRestaurantes();
}

async function filtrarRestaurantes() {

  const puntuacion = document.getElementById('puntuacion').value;
  const localidad = document.getElementById('localidad').value;

  document.getElementById('lista-restaurantes').innerHTML = '';
  restaurantes
    .filter(restaurante => {
      const estrellas = restaurante.puntos / restaurante.votos;
      if (estrellas < puntuacion) return false;
      if (localidad != '' && localidad != restaurante.localidad) return false;
      return true;
    })
    .forEach(mostrarRestaurante);
}

function mostrarPuntosRestaurantes(map) {
  restaurantes.forEach((r, i) => {
    L.marker([r.latitud, r.longitud])
      .on('click', async () => {
        irARestaurante(r._id);
      })
      .addTo(map);
  });

}
