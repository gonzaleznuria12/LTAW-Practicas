const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const node = document.getElementById("node");
const chrome = document.getElementById("chrome");
const electron1 = document.getElementById("electron1");
const ip1 = document.getElementById("ip1");
const numus = document.getElementById("numus");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.arch;
info2.textContent = process.platform;
info3.textContent = process.cwd();
node.textContent = process.versions.node;
chrome.textContent = process.versions.chrome;
electron1.textContent = process.versions.electron;

// Se muestra la url declarada en el main
electron.ipcRenderer.on('ip', (event, msg) => {
    console.log("Recibido: " + msg);
    ip1.textContent = msg;
});

// Al pulsar en botón, aparece el mensaje
btn_test.onclick = () => {
    console.log("Botón apretado");
    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "Boton de prueba... funciona :)");
}

// Enseña el número de usuarios conectados
electron.ipcRenderer.on('numus', (event, msg) => {
    console.log("Usuarios: " + msg);
    numus.textContent = msg;
});

//-- Mensaje recibido del proceso MAIN
electron.ipcRenderer.on('display', (event, msg) => {
    console.log("Recibido: " + msg);
    if(!msg.includes(' se ha unido</h5>')){
        display.innerHTML += '<p class="mess mess-r" style="text-align: right";>' + msg + '</p>';
        } else {
          // Si aparece ese mensaje en el texto, no declaro ninguna clase o estilo definido
          //(es puramente estético. Solo es css, no tiene funcionalidad js).
          display.innerHTML += '<p>' + msg + '</p>';
        }
});