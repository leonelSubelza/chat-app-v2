# Chat-App :calling::pencil::sparkles: 
Aplicación de chat virtual que te sumerge en la experiencia única de comunicarte de manera virtual con amigos, colegas o nuevos conocidos. Con una interfaz amigable y funcionalidades robustas, Chat-App ofrece una plataforma versátil para conectar con personas de todo el mundo.
## :star: Características Principales

`Personalización de Avatar y Nombre:`
Da vida a tu identidad virtual eligiendo un avatar único y personalizando tu nombre para que refleje tu estilo.

`Unirse a Chats de Manera Sencilla:`
- Únete a conversaciones existentes simplemente copiando la URL de la sala o ingresando el ID correspondiente.

`Crear Salas Privadas:`
- Conviértete en el administrador de tu propio espacio virtual creando salas privadas. Tendrás el control total sobre la administración de la sala.

`Administración de Sala`:
- Como administrador, puedes designar a otros usuarios como administradores o aplicar medidas disciplinarias como banear y desbanear participantes según sea necesario.

`Chat Grupal e Individual:`
- Disfruta de conversaciones animadas en el chat grupal o sumérgete en interacciones más privadas mediante mensajes directos.

### :scroll: Cómo Empezar 
`Selecciona tu Avatar y Nombre:`
- En la pantalla de inicio, elige un avatar que represente tu personalidad y asigna un nombre para que otros te identifiquen.

`Únete o Crea una Sala:`
- Únete a una sala existente copiando el link de otra sala creada o crea tu propia sala privada con un solo clic.

`Administración de Sala:`
- Si eres administrador, gestiona la sala según tus preferencias. Designa nuevos administradores, banea usuarios no deseados o desbanéalos si es necesario.

`Conversaciones Personalizadas:`
- Participa en charlas animadas en el chat grupal o inicia conversaciones privadas para una experiencia más íntima.

`Comparte el link de tu sala creada:`
- Puedes compartir el link de tu sala a tus amigos para que se unan.

## Tecnologías utilizadas 🔨
<table align="center">
    <tr>
     <td align="center" width="100">
      <a href="#">
        <img src="https://www.vectorlogo.zone/logos/java/java-icon.svg" width="50" height="50" alt="JAVA"/>
      </a>
      <br>JAVA
    </td>
    <td align="center" width="100">
      <a href="#">
        <img src="https://www.vectorlogo.zone/logos/springio/springio-icon.svg" width="50" height="50" alt="Spring Boot"/>
      </a>
      <br>Spring Boot
    </td>
    <td align="center" width="100">
      <a href="#">
        <img src="https://rstudio.github.io/websocket/reference/figures/websocket_logo.svg" width="50" height="50" alt="Spring Boot"/>
      </a>      
      <br>WebSocket
    </td>
    <td align="center" width="100">
     <a href="#">
      <img src="https://github.com/favicon.ico" width="50" height="50" alt="GitHub" />
     </a>
     <br>GitHub
    </td>
  </tr>
  <tr>
    <td align="center" width="100">
      <a href="#">
        <img src="https://www.typescriptlang.org/icons/icon-48x48.png?v=8944a05a8b601855de116c8a56d3b3ae" width="50" height="50" alt="JavaScript" />
      </a>
      <br>TypeScript
    </td>    
      <td align="center" width="100">
      <a href="#">
        <img src="https://cdn.worldvectorlogo.com/logos/react-2.svg" width="50" height="50" alt="JavaScript" />
      </a>
      <br>React
    </td>     
    <td align="center" width="100">
      <a href="#">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" width="50" height="50" alt="HTML5" />
      </a>
      <br>HTML5
    </td>
    </td> 
    <td align="center" width="100">
      <a href="#">
        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" width="50" height="50" alt="CSS3" />
      </a>
      <br>CSS3
    </td>
  </tr>
</table>

## :wrench: Características técnicas
 ## Backend :electric_plug:
 - El sistema hace uso de la librería spring-boot-starter-websocket para la comunicación bidireccional entre el serividor y el cliente utilizando una arquitectura de tipo Rest para la organización de carpetas
 - Se hace uso del proyecto lombok para simplificar código.
 - La aplicación utiliza jwt para la seguridad de los endpoints en el backend
 - El backend funciona como un intermediario con los mensajes y eventos que ocurren en la aplicación, como conexiones, desconexiones, baneos, desbaneos, y además maneja un registro de qué salas están activas, qué usuarios están conectados y quiénes están baneados.
 ## Frontend :computer:
 - En el frontend se hace uso del hook useContext en gran medida para manejar la conexión con el web socket. También se usa otro context para manejar los datos del usuario durante el uso de la aplicación, tanto como para manejar los chats como sus datos de sesión.
 - Se hace uso de react-bootstrap para el uso de componentes como Modals.
 - Se incluyen librerías como sonner para los mensajes toast, react-tooltip para agregar información sobre algunos botones en el chat, se incluye un sonido de notificación ante un mensaje recibido
 - El frontend fue creado utilizando vite para un manejo más fluido y liviano de la aplicación
 - Se hace uso de typescript para un manejo más seguro y eficiente en el frontend.


## :video_game: Imágenes del sistema 
:trollface:
### Menú de inicio
<p align="center" width="100">
    <img src="https://github.com/leonelSubelza/chat-app-v2/assets/85598026/17c8a385-efe0-4edb-be90-e022a2a6faf7" widht="800" height="400" />
</p>    

### Unirse a un chat
<p align="center" width="100">
    <img src="https://github.com/leonelSubelza/chat-app-v2/assets/85598026/9f886f83-3551-4180-b297-f3d8a703346f" widht="800" height="400" />
</p>

### Elegir un avatar
<p align="center" width="100">
    <img src="https://github.com/leonelSubelza/chat-app-v2/assets/85598026/b594b499-3f6e-4d2d-90b5-5340c49d01b3" widht="800" height="400" />
</p>
    
### Sala de chat
<p align="center" width="100">
    <img src="https://github.com/leonelSubelza/chat-app-v2/assets/85598026/14fcb4ba-e4f7-49f9-8988-7e58fc307db1" widht="800" height="400" />
</p>

