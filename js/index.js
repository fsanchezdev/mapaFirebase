import { centros } from './centros.js'

import { municipios } from './municipios.js'

/**
   * initApp handles setting up UI event listeners and registering Firebase auth listeners:
   *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
   *    out, and that is where we update the UI.
   */
function initApp () {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // [START_EXCLUDE]
      document.getElementById('sign-in').parentElement.setAttribute('href', '')
      // incluir saludo si está registrado
      document.getElementById('usuarioRegistrado').style.display = 'block'
      let saludo
      if (!document.getElementById('usuarioRegistrado').hasChildNodes()) { saludo = user.email }
      if (saludo === null) { saludo = user.phoneNumber }
      var saludoUsuario = document.createTextNode(saludo)// AÑADIDO

      document.getElementById('usuarioRegistrado').appendChild(saludoUsuario)

      // AÑADIDO SABADO
      document.getElementById('log-out').style.display = 'block'
      document.getElementById('sign-in').style.display = 'none'
      document.getElementById('quickstart-sign-up').style.display = 'none'
      document.getElementById('img-login').style.display = 'block'

      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      document.getElementById('usuarioRegistrado').style.display = 'none'
      document.getElementById('sign-in').textContent = 'Sign in'
      // [END_EXCLUDE]
    }
  })
  // [END authstatelistener]
}
window.onload = function () {
  initApp()
}

document.getElementById('log-out').addEventListener('click', () => {
  if (firebase.auth().currentUser) { firebase.auth().signOut() }
})

var mymap = L.map('mymap').setView([28.48, -16.32], 12)

L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href = "https://creativecommons.org/licenses/by-sa/2.0/" > CC - BY - SA < /a>, Imagery © <a href="https:/ / www.mapbox.com / ">Mapbox</a>',
    maxZoom: 80,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoieWV6enoiLCJhIjoiY2s0Y3F0bmM2MHB6ODNrbzJpMWNyaDVrdSJ9._9bGJ-vinXJ4AYS_x0fAnw'
  }
).addTo(mymap)

document.getElementById('botonFiltro1').addEventListener('click', () => fOculta('uno', 'dos', 'tres'))
document.getElementById('botonFiltro2').addEventListener('click', () => fOculta('dos', 'uno', 'tres'))
document.getElementById('botonFiltro3').addEventListener('click', () => fOculta('tres', 'dos', 'uno'))

// sacar las categorias de los centros
var categorias = centros.map(fCategorias)

function fCategorias (a) {
  var n = a.properties.nombre
  var tipo = n.split(/\s(.+)/)[0]
  // return a.properties.act + '-' + tipo
  return tipo
}
// creo array de categorias final sin elementos repetidos
var categoriasFINAL = Array.from(new Set(categorias))
categoriasFINAL.sort()

// guardar los nombres de los municipios en un array por orden alfabético
var mun = municipios.map(fMunicipios)

/**
 * @param {*} a
 * @returns {*} nombreMun
 */
function fMunicipios (mun) {
  return mun.NombreMun
}
// creo array de municipios
var municipiosFINAL = Array.from(new Set(mun))
municipiosFINAL.sort()

// crea desplegable para elegir municipio
const divSelectMunicipio = generarElemento('div', '', 'divSelect1', ['divSelect2'])
document.getElementById('seleccionMunicipio').appendChild(divSelectMunicipio)

const form1 = generarElemento('form', '', 'form1', ['d-flex', 'p-2'])
document.getElementById('divSelect1').appendChild(form1)

const select1 = generarElemento('select', '', 'seleccion', ['custom-select'])
select1.addEventListener('change', fSeleccionMunicipio)
document.getElementById('form1').appendChild(select1)

const opcion1 = generarElemento('option', 'Selecciona municipio')
opcion1.setAttribute('selected', 'selected')
document.getElementById('seleccion').appendChild(opcion1)

municipios.forEach(mun => {
  var opcion = generarElemento('option', mun.NombreMun)

  opcion.setAttribute('value', mun.CodMun)

  document.getElementById('seleccion').appendChild(opcion)
})

/**
 *
 * recoge el cod del municipio
 */
function fSeleccionMunicipio () {
  document.getElementById('seleccion2').style.display = 'block'
  var codMunicipioSeleccionado = document.getElementById('seleccion').value

  var centrosSeleccionados = []
  eliminarHijos('seleccion2')
  for (let i = 0; i < centros.length; i++) {
    var codProbar = centros[i].properties.mun
    if (codProbar.toString() === codMunicipioSeleccionado) {
      centrosSeleccionados.push(centros[i])
    }
  }
  // ordenar array de centros alfabéticamente
  centrosSeleccionados.sort(function (centro1, centro2) {
    if (centro1.properties.nombre < centro2.properties.nombre) {
      return -1
    }
    if (centro1.properties.nombre > centro2.properties.nombre) {
      return 1
    }
    return 0
  })

  var opcion2 = generarElemento('option', 'Selecciona centro')
  opcion2.setAttribute('value', 'Selecciona centro')
  document.getElementById('seleccion2').appendChild(opcion2)
  // enviar los datos al desplegable de los centros despues de elegir municipio
  centrosSeleccionados.forEach(centro => {
    var opcion2 = generarElemento('option', centro.properties.nombre)
    opcion2.setAttribute('value', centro.properties.nombre)
    document.getElementById('seleccion2').appendChild(opcion2)
  })
}

// desplegable de centros
var select2 = generarElemento('select', '', 'seleccion2', ['custom-select'])
select2.addEventListener('click', () => fSeleccionCentro('seleccion2'))
document.getElementById('form1').appendChild(select2)

var centroSelec

/**
 * se ejecuta después de elegir centro
 *
 * @param {object} centroEntrada
 */
function fSeleccionCentro (centroEntrada) {
  centroSelec = document.getElementById(centroEntrada).value
  if (centroSelec !== 'Selecciona centro') {
    var marcaFiltro1 = centros.find(fMarca)
    borrarMarcasCapas()

    fCrearUbicaciones(marcaFiltro1)
  }
}

/**
 *
 * @param {*} a
 * @returns {string} nombreCentro
 */
function fMarca (centro) {
  return centro.properties.nombre === centroSelec
}

/**
 * eliminar hijos de un elemento
 * @param {*} nodoRecibido
 */
function eliminarHijos (nodoRecibido) {
  var nodo = document.getElementById(nodoRecibido)
  nodo.querySelectorAll('*').forEach(n => n.remove())
}

const capas = []
/**
 *
 *
 * @param {*} centro
 */
function fCrearUbicaciones (centro) {
  var direccion, telefono, mail

  var nombre = centro.properties.nombre
  if ((centro.properties.sigla != null) & (centro.properties.dir != null) && (centro.properties.cp != null)) {
    direccion = centro.properties.sigla + ' ' + centro.properties.dir + ', ' + centro.properties.cp
  } else {
    direccion = ' '
  }
  if (centro.properties.tf != null) {
    telefono = centro.properties.tf
  } else {
    telefono = ' '
  }

  if (centro.properties.email != null) {
    mail = centro.properties.email
  } else {
    mail = ' '
  }
  var iconIMG = L.icon({
    iconUrl: '../img/pin.png',
    iconSize: [70, 70], // size of the icon
    shadowSize: [5, 6], // size of the shadow
    iconAnchor: [27, 60], // point of the icon which will correspond to marker's location
    shadowAnchor: [14, 62], // the same for the shadow
    popupAnchor: [0, -60]
  })
  capas.push(L.marker([centro.geometry.coordinates[1], centro.geometry.coordinates[0]], { icon: iconIMG })
    .addTo(mymap)
    .bindPopup(
      "<h1 class='h4'>" + nombre +
      "</h1> <hr><h1 class='h6 text-muted''>" + direccion +
      "</h1><h1 class='h6 text-info'>" + telefono +
      "</h1> <a class='h6 ' style=\"color:grey;text-decoration: underline;background: white;\" href=\"https://" + mail + "\" onmouseover=\"this.style.color='#17a2b8'\" onmouseout=\"this.style.color='grey'\">" + mail +
      '</a>'
    )
    .openPopup())
  mymap.flyTo(L.latLng(centro.geometry.coordinates[1], centro.geometry.coordinates[0]), 15)
}

/**
 * Borra todos los marcadores y el circulo
 *
 */
function borrarMarcasCapas () {
  capas.forEach((marca) => mymap.removeLayer(marca))
}

mymap.addEventListener('click', onMapClick)
// QUE OBJETO ES ESTE QUE APARECE DE LA NADA

/**
 *
 * @param {*} centro
 */
function onMapClick (centro) {
  borrarMarcasCapas()
  var iconIMG = L.icon({
    iconUrl: '../img/pin2.png',
    iconSize: [50, 50],
    shadowSize: [15, 16], // size of the shadow
    iconAnchor: [0, 54], // point of the icon which will correspond to marker's location
    shadowAnchor: [14, 62], // the same for the shadow
    popupAnchor: [3, -49]
  })
  const marca = L.marker(centro.latlng, { icon: iconIMG })
    .addTo(mymap)
    .bindPopup(
      '<p class="h5">Estás aquí</p>' +
      '<p>Centros cercanos </p>'
    )
  capas.push(marca)

  mostrarCercanos(marca)
  mymap.flyTo(centro.latlng, 14)
  marca.openPopup()
}

/**
 * Muestra las marcas cercanas
 *
 * @param {Object} marca
 */
function mostrarCercanos (marca) {
  var circle = L.circle(marca._latlng, {
    color: 'Indigo',
    fillColor: 'Indigo',
    fillOpacity: 0.1,
    radius: 3000
  }).addTo(mymap)

  capas.push(circle)

  centros.forEach(centro => {
    if (distanciaCoords(centro.geometry.coordinates, marca._latlng) * 1000 < circle.options.radius) {
      fCrearUbicaciones(centro)
    }
  })
}

/**
 * distancia de punto a punto usando la formula haversine
 *
 * @param {number[]} coordsCentro
 * @param {number[]} coordsLugar
 * @returns {number} distancia
 */
function distanciaCoords (coordsCentro, coordsLugar) {
  const lon1 = coordsCentro[0]
  const lat1 = coordsCentro[1]

  const lon2 = coordsLugar.lng
  const lat2 = coordsLugar.lat

  const rTierra = 6371 // km

  const diffLat = toRad(lat2 - lat1)

  const diffLon = toRad(lon2 - lon1)

  const a = Math.pow(Math.sin(diffLat / 2), 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(diffLon / 2) * Math.sin(diffLon / 2)

  const distAngular = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = rTierra * distAngular

  return distancia
}

/**
 *
 * @param {*} valor
 * @returns {number} valorEnRad
 */
function toRad (valor) {
  return valor * Math.PI / 180
}

// sacar los nombres de los centros
var nombreCentros = centros.map(fNombreC)

/**
 * @param {Object} centro
 * @returns {string} nombreC
 */
function fNombreC (centro) {
  var nombreC = centro.properties.nombre
  return nombreC
}

nombreCentros.sort()

// desplegable con busqueda y filtrado del cuadro de texto
const buscar = document.getElementById('buscarCentro')

/**
 * @param {string[]} values
 */
function generarDropDown (values) {
  for (const val of values) {
    const input = generarElemento('input', '', val, ['dropdown-item'])
    input.setAttribute('type', 'button')
    input.setAttribute('value', val)
    input.addEventListener('change', () => fSeleccionCentro(val))
    document.getElementById('menuItems').appendChild(input)
  }

  // Esconder el mensaje de ninguna coincidencia
  document.getElementById('vacio').style.display = 'none'
}

// comprobar lo que se va escribiendo con los nombres de la lista de centros
window.addEventListener('input', () => {
  filter(buscar.value.trim().toLowerCase())
})

// Encontrar cada nombre de centro en la lista
// guardar los inputs del dropdown
const elemInputs = document.getElementsByClassName('dropdown-item')

/**
 *
 * comprobar que la cadena que se va tecleando la tiene algún nombre de centro
 * @param {number} nCentro
 */
function filter (nCentro) {
  const length = elemInputs.length
  let escondidos = 0
  for (let i = 0; i < length; i++) {
    if (elemInputs[i].value.toLowerCase().includes(nCentro)) {
      (elemInputs[i]).style.display = 'block'
    } else {
      (elemInputs[i]).style.display = 'none'
      escondidos++
    }
  }

  // si no hay coincidencias, mostrar el mensaje
  if (escondidos === length) {
    document.getElementById('vacio').style.display = 'block'
  } else {
    document.getElementById('vacio').style.display = 'none'
  }
}

// ----------------------------------------------------------------------------------------------
// CONVERTIR SI DA TIEMPO,       COMO SERIA EN JS NORMAL
// -------------------------------------------------------------------------------------------
//son los hijos del menuitems
// click en un elemento, el nombre del boton pasa a ser el del elemento
$('#menuItems').on('click', '.dropdown-item', function () {
  $('#dropdown_valores').dropdown('toggle')
  document.getElementById('dropdown_valores').textContent = this.value
  document.getElementById('dropdown_valores').addEventListener('click', fSeleccionCentro(this.value))
})

generarDropDown(nombreCentros)

/**
 *
 *
 * @param {string} boton1
 * @param {string} boton2
 * @param {string} boton3
 */
function fOculta (boton1, boton2, boton3) {
  document.getElementById(boton1).style.display = 'block'
  document.getElementById(boton2).style.display = 'none'
  document.getElementById(boton3).style.display = 'none'
}

document.getElementById('botonMenu').addEventListener('click', fOcultarMenu)

/**
 *
 */
function fOcultarMenu () {
  var oculto = document.getElementById('filtros').style.display
  if (oculto === 'block') {
    document.getElementById('filtros').style.display = 'none'
  }
  if ((oculto === '') || (oculto === 'none')) {
    document.getElementById('filtros').style.display = 'block'
  }
}

// acciones para el modal del registro

/**
 *  Muestra el tema de login creando el modal
 *
 * @param {*} id
 * @param {*} boton
 * @param {*} span
 */
function fCrearModal (id, boton, span) {
  var modal = document.getElementById(id)

  // Get the <span> element that closes the modal
  var span = document.getElementById(span)

  // When the user clicks the button, open the modal

  modal.style.display = 'block'

  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', () => { modal.style.display = 'none' })

  // When the user clicks anywhere outside of the modal, close it

  window.addEventListener('click', () => {
    if (event.target === modal) { modal.style.display = 'none' }
  })
}

document.getElementById('quickstart-sign-up').addEventListener('click', () => {
  fOcultarModal('modalRegistro')
  fCrearModal('modalRegistro', 'quickstart-sign-up', 'spanRegistro')
})
document.getElementById('sign-in').addEventListener('click', () => {
  fOcultarModal('modalSesion')
  fCrearModal('modalSesion', 'sign-in', 'spanSesion')
})

/**
 * Oculta el tema de login camuflando el modal
 *
 * @param {*} id
 */
function fOcultarModal (id) {
  document.getElementById(id).style.display = 'none'
}

// AÑADIDO SABADO
document.getElementById('log-out').addEventListener('click', () => {
  fOcultarModal('log-out')
  document.getElementById('sign-in').style.display = 'block'
  document.getElementById('usuarioRegistrado').style.display = 'none'
  document.getElementById('img-login').style.display = 'none'
  document.getElementById('quickstart-sign-up').style.display = 'block'
})

/**
 * Genera un elemento de html
 * @param {String} elemento
 * @param {String} text
 * @param {Number} id
 * @param {String[]} clases
 */
function generarElemento (elemento, text = '', id = '', clases = '') {
  const nodo = document.createElement(elemento)
  if (text !== '') {
    const texto = document.createTextNode(text)
    nodo.appendChild(texto)
  }
  if (clases !== '') {
    clases.forEach((item) => { nodo.classList.add(item) })
  }
  if (id !== '') { nodo.setAttribute('id', id) }
  return nodo
}
