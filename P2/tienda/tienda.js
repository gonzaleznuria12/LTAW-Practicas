const http = require('http');
const fs = require('fs');

const PUERTO = 8080;

const PRODUCTOS_JSON = fs.readFileSync('motos.json');

//-- Obtener el array de productos
let productos = JSON.parse(PRODUCTOS_JSON);

// Se crea el servidor
const server = http.createServer((req, res) => {
  let myURL = new URL(req.url, 'http://' + req.headers['host']);

  let page = "";
  let successful = false;
  let cookie1 = "Carro=";
  let nombre = "";
  let carro = [];

  //-- Leer la Cookie recibida
  const cookie = req.headers.cookie;

  //-- Hay cookie
  if (cookie) {
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombres y valores por separado
      let [ok, valor] = element.split('=');

      //-- Leer el usuario
      //-- Solo si el nombre es 'User'
      if (ok.trim() === 'User') {
        nombre = valor;
      } else if (ok.trim() === 'Carrito') {
        cookie1 = element;
        carro = valor.split('-');
        carro.pop();
      }
    });
  }

  // Se llama a la página principal por defecto
  if (myURL.pathname == '/procesar') {
    nombre = myURL.searchParams.get('nombre');
    if (nombre == productos["Usuario"][0]["User"] || nombre == productos["Usuario"][1]["User"]) {
      res.setHeader('Set-Cookie', 'User=' + nombre);
      page = "49c.html";
      successful = true;
    }
  } else if (myURL.pathname == '/Aerox' || myURL.pathname == '/Jog' || myURL.pathname == '/Vespa' || myURL.pathname == '/ApriliaC' || myURL.pathname == '/ApriliaCC') {
    if (nombre) {
      cookie1 += myURL.pathname.slice(1) + "-";
      res.setHeader('Set-Cookie', cookie1);
      page = "49c.html";
    }
  } else if (myURL.pathname == '/comprar') {
    if (nombre) {
      const FICHERO_JSON_OUT = "productos.json";
      let direc = myURL.searchParams.get('direccion');
      let card = myURL.searchParams.get('tarjeta');

      let pedido = {
        "User": nombre,
        "Direccion": direc,
        "Card": card,
        "Producto": cookie1.slice(7) // Eliminar el prefijo "Carro="
      };

      productos["Pedidos"].push(pedido);

      //-- Convertir la variable a cadena JSON
      let myJSON = JSON.stringify(productos);

      //-- Guardarla en el fichero destino
      fs.writeFileSync(FICHERO_JSON_OUT, myJSON);
      page = "comprar.html";
    }
  } else if (myURL.pathname == '/') {
    page = '49c.html';
  } else {
    page = myURL.pathname.slice(1);
  }

  fs.readFile(page, function (err, data) {
    if (err) {
      // Si se pide un recurso que no existe, salta la página de error
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return fs.createReadStream('error.html').pipe(res);
    }

    if (page.includes('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (page.includes('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (page.includes('.js')) {
      res.setHeader('Content-Type', 'application/js');
    } else if (page.includes('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (page.includes('.jpg')) {
      res.setHeader('Content-Type', 'image/jpg');
    } else if (page.includes('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (page.includes('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }

    if (successful) {
      data = data.toString().replace('<a href="login.html"><img src="fotos/perfil.jpeg" alt="" width="30px" ;=""></a>', nombre);
    }

    if (page == 'carro.html' || page == 'comprar.html') {
      let resumen = '';
      carro.forEach((p) => {
        resumen += p + '<br>';
      });
      resumen += '';
      data = data.toString().replace('Aún no hay nada añadido al carrito :(', resumen);
    }
    res.write(data);
    res.end();
  });
});

server.listen(PUERTO);

console.log("Escuchando en puerto: " + PUERTO);
