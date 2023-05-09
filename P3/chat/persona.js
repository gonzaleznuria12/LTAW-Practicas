//Establezco constantes que, gracias a su identificador, podré usar en mi archivo html
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const usuario = document.getElementById("user");
const x = document.getElementById("us");
const userestablecido = document.getElementById("userestablecido");

//Declaro que el usuario se llamará 'Anónimo' siempre que no establezca otro nombre
let User = "Anónimo";
// Pongo la notificación de escribiendo en falso, por defecto.
let escribiendo = false;
const socket = io();
// Declaro el audio que voy a usar de tono de notificación
let notif = new Audio('notificacion.mp3');

//Creo esta función que servirá para la estructura de los mensajes y que se vean en pantalla
socket.on("message", (msg)=>{
  //Declaro que si el mensaje no incluye ese texto específico, la estructura sea así
  if(!msg.includes(' se ha unido</h5>')){
  display.innerHTML += '<p class="mess mess-r" style="text-align: right";>' + msg + '</p>';
  } else {
    // Si aparece ese mensaje en el texto, no declaro ninguna clase o estilo definido
    //(es puramente estético. Solo es css, no tiene funcionalidad js).
    display.innerHTML += '<p>' + msg + '</p>';
  }
});


// Si se detectan cambios en la entrada de texto (escribir), el valor
// de mi variable 'escribiendo' se pone en verdadero y salta la notificación
msg_entry.oninput = () => {
  if(!escribiendo){
    escribiendo = true;
    // Te avisa de que el usuario establecido está escribiendo
    socket.send(User + ' esta escribiendo...');
  };
};

// Al apretar el botón enter, se envía un mensaje al servidor 
// y aparece en nuestro display
msg_entry.onchange = () => {
  if (msg_entry.value)
    socket.send(User + ": <br>" + msg_entry.value);
    escribiendo = false;
  //-- Borrar el mensaje actual
  msg_entry.value = "";
  // Suena el sonido de notifiación
  notif.play();
}

// Al cambiar el valor usuario...
usuario.onchange = () => {
    if (usuario.value )
    // el usuario pasa a llamarse como lo has declarado tu
    User = usuario.value;
    console.log("nombre usuario"+ usuario.value);
    // Desaparece el display que te permite cambiar el nombre
    document.getElementById("user").style.display = "none";
    document.getElementById("us").style.display = "none";
    // Te confirma que has cambiado el usuario y te imprime el que has establecido
    userestablecido.innerHTML = "Nombre de usuario:"+ ' ' + User; 
    // Manda un mensaje al chat avisando de que te has unido
    socket.send('<h5 style="text-align: center">' + User + ' se ha unido</h5>');
}