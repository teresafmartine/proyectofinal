const config = {
  apiKey: "AIzaSyCTbIaLKWIQXgT5zGSg4Iobq72OO5Q2e_A",
  authDomain: "proyectofinal-1a97e.firebaseapp.com",
  projectId: "proyectofinal-1a97e",
  storageBucket: "proyectofinal-1a97e.appspot.com",
  messagingSenderId: "1086701222701",
  appId: "1:1086701222701:web:b87ef0f5c40f5717cd71a4"
};
// Configurar Firebase con las credenciales del archivo JSON
firebase.initializeApp(config);

// Referencia a la base de datos
var database = firebase.firestore();
var storage = firebase.storage();
var auth = firebase.auth();

var provider = new firebase.auth.GoogleAuthProvider();

var restaurantes = [];
var comentarios = [];
// Recuperar los restaurantes de la base de datos

async function inicializar() {
//  await cargarLogin();
  await cargarRestaurantes();
  //mostrarTodos();


  const user = auth.currentUser;
  if (user == null) {
    irAIniciarSesion();
  }
  else {
    irAInicio();
  }
  //await cargarComentarios();

  const map = L.map('map').setView([43.361394558091256, -5.850188564940662], 13);

  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  mostrarPuntosRestaurantes(map);

  actualizarBotonesLogin();
}

/*cargar los comentarios de los clientes*/
async function cargarComentarios(idRestaurante) {
  const snapshot = await database
      .collection('restaurantes')
      .doc(idRestaurante)
      .collection('comentarios').get();

  comentarios = [];
  snapshot.forEach(async function(doc) {
    const comentario = doc.data()
    comentario._id = doc.id
    comentarios.push(comentario);
    console.log(comentario);
  });
}

/*mostrar solamente un restaurante*/
async function mostrarUno(id, event) {
  if (event && event.preventDefault)
    event.preventDefault();

  cargarComentarios(id);

  document.getElementById('lista-restaurantes').innerHTML = '';
  restaurante = restaurantes.find(r => r._id == id);
  // Aquí puedes hacer algo con cada restaurante, como agregarlo a tu página HTML

  var estrellas = restaurante.puntos / restaurante.votos;
  var imagenesEstrellas = '';
  var contEstrella = 0;
  while (contEstrella < estrellas) {
    imagenesEstrellas += '<img src="img/estrella.png" style="width: 30px; height: 30px">';
    contEstrella++;
  }

  var nombre = restaurante.nombre;
  var direccion = restaurante.ubicacion + ' (' + restaurante.localidad + ')';
  var telefono = restaurante.Telefono;
  var puntuacion = imagenesEstrellas;
  var ubicacion = restaurante.latitud + '/' + restaurante.longitud ;
//  var comentarios = restaurante.comentarios;

  var refImagen = await storage.refFromURL(restaurante.imagen).getDownloadURL();

  // Agregar el restaurante a tu página HTML
  var restauranteElemento = document.createElement('div');

  var html = `
    <div class="contenedor-restaurante">
      <img src="${refImagen}">
      <div id="restaurante-info">
        <h2>${nombre}</h2>
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
          Votos antiguos clientes: ${puntuacion}
        </p>
      </div>
    </div>
  `;

  restauranteElemento.innerHTML = html;

   const comentarios = await mostrarcomentarios(id);
   comentarios.style.display = 'none';
//boton para opinar clientes
  const user = auth.currentUser;
  if (user !== null) {

     const boton = document.createElement('button');
     boton.textContent = '¿Has visitado este restaurante? Deja tu comentario';

     // popup para q dejen comentario
     boton.addEventListener('click', function() {
       comentarios.style.display = 'block';
       mostrarAlert('¿Has visitado este restaurante?', 'Dejanos tu opinión para que el resto de participantes de la aplicación puedan saber tus opiniones');
     });

     // Agregar el botón al contenedor del restaurante
     restauranteElemento.appendChild(boton);
     restauranteElemento.appendChild(comentarios);
   }

  document.getElementById('lista-restaurantes').appendChild(restauranteElemento);
}


async function mostrarcomentarios(idRestaurante) {
  var resultado = document.createElement('div');

  /*escribir comentario*/
  const raterDivCont = document.createElement('div'); //estrellitas para opinar del restaurante
  const raterDiv = document.createElement('div'); //estrellitas para opinar del restaurante
  const rater = raterJs({
    element: raterDiv,
    starSize: 40,
    rateCallback:function rateCallback(rating, done) {
      this.setRating(rating);
      done();
    }
  });

  raterDivCont.appendChild(raterDiv);
  resultado.appendChild(raterDivCont);


    const textocomentario = document.createElement('textarea');
    textocomentario.setAttribute('id', 'textocomentario');
    textocomentario.placeholder = 'Escribe tu comentario aquí...';
    resultado.appendChild(textocomentario);

    const botoncomentario = document.createElement('button');
    botoncomentario.textContent = 'Deja un comentario sobre este restaurante';

    const mensajeConfirmacion = document.createElement('p');
    mensajeConfirmacion.textContent = 'Tu comentario se guardó correctamente';
    mensajeConfirmacion.style.display = 'none'; // Inicialmente oculto
    resultado.appendChild(mensajeConfirmacion);

     botoncomentario.addEventListener('click', function() {
      aniadirComentario(idRestaurante, rater.getRating()); // Asume que esta función está definida en otro lugar

      // Mostrar mensaje de confirmación
      mensajeConfirmacion.style.display = 'block';

      // Ocultar mensaje después de unos segundos
      setTimeout(function() {
        mensajeConfirmacion.style.display = 'none';
      }, 3000); // Ocultar mensaje después de 3 segundos

      // Ocultar textarea y botón de comentario
      textocomentario.style.display = 'none';
      raterDiv.style.display = 'none';
      botoncomentario.style.display = 'none';
    });
    resultado.appendChild(botoncomentario);

  comentarios.forEach(async (comentarios) => {
    console.log(comentarios);
    // Aquí puedes hacer algo con cada restaurante, como agregarlo a tu página HTML
    var correoelectronico = comentarios.nombre;
  var contenido = comentarios.contenido;

    // Agregar el restaurante a tu página HTML
    var comentarioElemento = document.createElement('div');
   comentarioElemento.innerHTML = '<h2 id="h2comentarios">Comentario de antiguo cliente:</h2><p><b>Correo cliente: </b>' + correoelectronico + '</p><p><b>Comentario: </b>' + contenido + '</p>'
       ;
    resultado.appendChild(comentarioElemento);
  });
/*boton cerrar */
  const boton = document.createElement('button');
boton.textContent = 'Cerrar comentarios';

// popup para q dejen comentario
boton.addEventListener('click', function() {
  resultado.style.display = 'none';

});
resultado.appendChild(boton);
  return resultado;
}
/*opcion añadir comentario*/
async function aniadirComentario(idRestaurante, puntuacion) {
  console.log(puntuacion);

  const user = auth.currentUser;
  if (user === null) {
    alert('No puedes comentar sin registrarte');
  }
  else {

    const texto = document.getElementById('textocomentario').value;
    const email = user.email;

    const snapshot = await database
        .collection('restaurantes')
        .doc(idRestaurante)
        .collection('comentarios').add({
          contenido: texto,
          nombre: email
        });
    }

    const snapshot2 = await database
        .collection('restaurantes')
        .doc(idRestaurante)
        .update({
          votos: firebase.firestore.FieldValue.increment(1),
          puntos: firebase.firestore.FieldValue.increment(puntuacion)
        });
}
//poder registrar y cerrar sesion
function actualizarBotonesLogin() {
  const user = auth.currentUser;
  if (user === null) {
    document.getElementById('iniciarSesion').style.visibility = 'visible';
    document.getElementById('cerrarSesion').style.visibility = 'hidden';
  }
  else {
    document.getElementById('iniciarSesion').style.visibility = 'hidden';
    document.getElementById('cerrarSesion').style.visibility = 'visible';
  }
}

async function  login() {

 const email = document.getElementById('inputEmail').value;
 const password = document.getElementById('inputPassword').value;

 try {
   const userCredentials = await auth.signInWithEmailAndPassword(email, password);
   console.log(userCredentials);
   mostrarAlert('Login completado', 'Te has logueado correctamente en la aplicación');
 }
 catch (e) {
   mostrarAlert('Error', 'El usuario o contraseña no son correctos');
 }
 actualizarBotonesLogin();
}

async function logout() {
  await auth.signOut();
  mostrarAlert('Logout completado', 'Te has desconectado correctamente de la aplicación');
  actualizarBotonesLogin();
}

async function  registrarse() {

 const email = document.getElementById('inputEmailRegistrarse').value;
 const password = document.getElementById('inputPasswordRegistrarse').value;
const location = document.getElementById('inputLocalidadRegistrarse').value;
 try {
   const userCredentials = await auth.createUserWithEmailAndPassword(email, password);
   console.log(userCredentials);


   const snapshot = await database
       .collection('usuarios').add({
         email: email,
         localidad: location
       });
   mostrarAlert('Registro completado', 'Te has registrado correctamente de la aplicación');
 }
 catch (e) {
  mostrarAlert('Error', 'Correo o clave no son correctas');
 }
}


//mostrar popup como ventana emergente cuando algo no esta correcto
function mostrarAlert(titulo, mensaje) {
  document.getElementById('alert').style.display = 'flex';
  document.getElementById('alert-titulo').innerText = titulo;
  document.getElementById('alert-texto').innerText = mensaje;
}

function ocultarAlert() {
  document.getElementById('alert').style.display = 'none';
}

window.onload = inicializar;
