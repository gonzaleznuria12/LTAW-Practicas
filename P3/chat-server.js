const http = require('http');
const express = require('express');
const socket = require('socket.io');
const colors = require('colors');

const PUERTO = 9000;

const commandos = 'Los comandos disponibles son: /help, /list, /hello y /date';
const welcome = '<h3>~~~~~ BIENVENIDO ~~~~~</h3>';
const bye = '<h4 id="bye">~~~ Un usuario se ha marchado ~~</h3>';
const hello = 'Holaaaa Holaaa Holaa Hola';
const usuario = '<h4 id="new">~~ Nuevo usuario ~~</h4>';

//-- Server
const app = express();
const server = http.Server(app);
const io = socket(server);

let connect_count = 0;

//-- Entrada web
app.get('/', (req, res) => {
    let path = __dirname + '/chat.html';
    res.sendFile(path);
    console.log("Acceso al chat");
});

app.use('/', express.static(__dirname +'/'));


//-- Websockets
io.on('connection', (socket) => {
    //-- Nuevo usuario  
    console.log('-- Nuevo usuario--'.blue);
    connect_count += 1;
    socket.send(welcome);
    socket.broadcast.emit('message', usuario);

    //-- Desconexión
    socket.on('disconnect', function(){
        console.log('-- FIN CONEXIÓN --'.yellow);
        socket.broadcast.emit('message', bye);
        connect_count -= 1;
    });  

    //-- Mensaje a todos los usuarios
    socket.on("message", (msg)=> {
        let mymensaje = msg.slice(27);
        console.log('Mensaje: ' + mymensaje.magenta);

        const date = new Date(Date.now());
        let comandos = msg.split(' ')[5];
        console.log("comandoooo",comandos);

        if (comandos.startsWith('/')) {
            
            switch(comandos){
                case '/help':
                    console.log('Lista de comandos'.blue);
                    socket.send(commandos);
                break;
                case '/list':
                    console.log('Lista de usuarios'.blue);
                    socket.send('totla de usuarios ' + connect_count);
                break;
                case '/hello':
                    console.log('Holi'.blue);
                    socket.send(hello);
                break;
                case '/date':
                    console.log('Fecha'.blue);
                    socket.send(date);
                break;
                default:
                    console.log("el mensaje essss: ", msg)
                    console.log('Not Found'.blue);
                    socket.send('Comando no reconocido. Los comandos están en /help');
                break;
            }
        } else {
            io.send(msg);
        }; 
    });
});

//-- Lanzar el server
server.listen(PUERTO);
console.log('Escuchando en puerto: ' + PUERTO);