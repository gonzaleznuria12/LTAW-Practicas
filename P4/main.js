const http = require('http');
const express = require('express');
const socket = require('socket.io');
const colors = require('colors');
const electron = require('electron');
const ip = require('ip');

const PUERTO = 9090;

const commandos = 'Los comandos disponibles son: /help, /list, /hello y /date';
const welcome = '<h3>~~~~~ BIENVENIDO ~~~~~</h3>';
const bye = '<h4 id="bye">~~~ Un usuario se ha marchado ~~</h3>';
const hello = 'Holaaaa Holaaa Holaa Hola';
const usuario = '<h4 id="new">~~ Nuevo usuario ~~</h4>';

//-- Server
const app = express();
const server = http.Server(app);
const io = socket(server);

let usuarios_conect = 0;
let main = null;

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
    usuarios_conect += 1;
    main.webContents.send('usuarios_conect', usuarios_conect);
    socket.send(welcome);
    socket.broadcast.emit('message', usuario);

    //-- Desconexión
    socket.on('disconnect', function(){
        console.log('-- FIN CONEXIÓN --'.yellow);
        socket.broadcast.emit('message', bye);
        usuarios_conect -= 1;
        main.webContents.send('msg', bye);

    });  

    //-- Mensaje a todos los usuarios
    socket.on("message", (msg)=> {
        let mymensaje = msg.slice(27);
        console.log('Mensaje: ' + mymensaje.magenta);

        const date = new Date(Date.now());
        let comandos = msg.split(' ')[5];

        main.webContents.send('msg', msg); 

        if (comandos.startsWith('/')) {
            
            switch(comandos){
                case '/help':
                    console.log('Lista de comandos'.blue);
                    socket.send(commandos);
                break;
                case '/list':
                    console.log('Lista de usuarios'.blue);
                    socket.send('totla de usuarios ' + usuarios_conect);
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

// --------- ELECTRON -----------
electron.app.on('ready', () => {
    console.log("¡PREPARADO!");
  
    //-- Crear la ventana principal de nuestra aplicación
    main = new electron.BrowserWindow({
        width: 800,   //-- Anchura 
        height: 700,  //-- Altura
  
        //-- ACCESO AL SISTEMA
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //-- Quitar menú por defecto
    main.setMenuBarVisibility(false)
  
    //-- Cargar interfaz gráfica en HTML
    let interfaz = "index.html"
    main.loadFile(interfaz);
  
    main.on('ready-to-show', () => {
        main.webContents.send('ip', 'http://' + ip.address() + ':' + PUERTO);
    });
});

//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
    console.log(msg);
    //-- Enviar mensaje de prueba
    io.send(msg);
    main.webContents.send('msg', msg);

});


//-- Lanzar el server
server.listen(PUERTO);
console.log('Escuchando en puerto: ' + PUERTO);
