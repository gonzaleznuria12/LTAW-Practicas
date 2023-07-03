//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

//-- Cargar sonido para cuando se reciba un mensaje
let tono = new Audio('tonomensaje.mp3');

//-- Declaramos lo siguiente para ver si el usuario esta escribiendo
const msg_writing = "UsuarioX está escribiendo...";
let writing = false;

socket.on("message", (msg)=>{
  display.innerHTML += '<p>' + msg + '</p>';
  tono.play();
});

//-- Establecemos la funcion para ver si estan escribiendo
msg_entry.oninput = () => {
  if (!writing){
    socket.send(msg_writing);
    writing = true;
  }
}

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
  if (msg_entry.value)
    socket.send(msg_entry.value);
    writing = false;
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}