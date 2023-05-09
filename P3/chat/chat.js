//-- Cargar las dependencias
const socketServer = require('socket.io').Server;
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 9090;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = new socketServer(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  let path = __dirname + '/public/chat.html';
  res.sendFile(path);
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//Establezco un valor predeterminado para la variable num
let num = 0;

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  console.log('** NUEVA CONEXIÓN **'.yellow);
  // Mensaje de bienvenida al chat
  socket.write('¡Bienvenido al chat de ISAM!');
  // El numero de usuarios aumenta 1 cada vez que alguien se conecta
  num += 1;
  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    //Mensaje a los demás usuarios informando de que alguién abandonó el chat
    io.send('Un usuario ha abandonado el chat');
    // El número de usuarios en el servidor disminuye 1
    num -= 1;
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    // Establezco ifs que determinan que si el mensaje incluye ese comando y no la frase ' se ha unido</h5>',
    // entonces hará una cosa u otra dependiendo del comando que le pides
    if (msg.includes('/help') && !msg.includes(' se ha unido</h5>')){
      // imprime una lista de comandos a usar y sus funciones
      socket.write('Los comandos disponibles son: <br> <strong>/help:</strong> Este mismo :) <br> <strong>/list:</strong> Devolverá el número de usuarios conectados <br> <strong>/hello:</strong> El servidor nos devolverá el saludo <br> <strong>/date:</strong> Nos devolverá la fecha');
    }else if(msg.includes('/hello') && !msg.includes(' se ha unido</h5>')){
      // Te saluda
      socket.write('¡Hola! Mucho ánimo con la carrera :)');
    }else if(msg.includes('/list') && !msg.includes(' se ha unido</h5>')){
      // Te dice el número total de usuarios conectados al servidor
      socket.write('Hay un total de ' + num + ' usuarios conectados');
    }else if(msg.includes('/date') && !msg.includes(' se ha unido</h5>')){
      // Establece la fecha
      const tiempoTranscurrido = Date.now();
      const hoy = new Date(tiempoTranscurrido);
      // Imprime la fecha, específicamente la de España, en el formato Español
      socket.write('Hoy es: ' + hoy.toLocaleString('es-ES'));
    }else if(msg.includes('/' + '') && !msg.includes(' se ha unido</h5>') && !msg.includes('/date') && !msg.includes('/list') && !msg.includes('/help') && !msg.includes('/hello') ){
      // Si usas un comando no establecido, te salta un error con el siguiente mensaje:
      socket.write('Lo siento pero no es un comando válido :(');
    }else{
      // Si lo escrito no es un comando, se imprime en el chat y en el terminal el mensaje que has escrito
        console.log("Mensaje Recibido!: " + msg.blue);
        //-- Reenviarlo a todos los clientes conectados
        io.send(msg);
    }

  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);