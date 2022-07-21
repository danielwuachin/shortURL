/* mongodb+srv://wuachin:<password>@cluster0.wcnwx.mongodb.net/?retryWrites=true&w=majority */

const express = require("express");
const session = require("express-session");
// para crear las sesiones flash
const flash = require("connect-flash");

// pasport para el manejo de sesiones de login
const passport = require("passport");

// CSRF
const csrf = require("csurf");

const { create } = require("express-handlebars");
const User = require("./models/User");
const app = express();

//middlewares siempre vand despues del app

/* sessiones
esto se almacena en la memoria de la maquina, sirve para que el usuario no tenga que iniciar sesion cada vez que refresca
se recomienda que siempre se almacenen en base de datos 
se instalan las sesiones, se crea el middleware, se crean las sesiones
y se crean las rutas donde se crearan las sesiones*/
app.use(
  session({
    // palabra secreta para darle seguridad a la sesion
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    name: "secret-name",
  })
);

// flash, asi de simple se usa
app.use(flash());

/*  usaremos passport SIN la estrategia local ya que hicimos manualmente las validaciones de usuarios tanto de iniciar sesion como de que el usuario se confirmo con token
 
primero lo inicializamos y despues usamos la sesion

basicamente con el metodo serialize se crea la sesion con los datos que quieras del usuario, y luego cada vez que se recargue la pagina se ejecutara deserializer para que al recargar lea de nuevo la sesion y pueda verificar si el usuario tiene autenticacion para los datos de la pagina solicitada
*/
app.use(passport.initialize());
app.use(passport.session());

// creamos el req.user con passport, enviamos el usuario y callback... el objeto user de esta funcion ES EL QUE VIENE DE USAR req.login en el controlador cuando todo sale bien
passport.serializeUser((user, done) =>
  // se le pasa un mensaje y la data
  done(null, { id: user.id, userName: user.userName })
);

// para cuando se recargue la pagina y volver a cargar la sesion
passport.deserializeUser(async (user, done) => {
  // es necesario revisar la base de datos?, se hace async
  const userDB = await User.findById(user.id);

  // hacemos lo mismo pero con el usuario de la base de datos
  return done(null, { id: userDB._id, userName: userDB.userName });
});
/*
ejemplo de como usar flash



//esta es la ruta que recibe el mensaje flash -  al actualizar esta pagina se destruyen las sesiones flash y por ende los mensajes flash

//NOTA, esto solo vive una vez, si lo llamas en consola, se acba su uso y muere
app.get("/mensaje-flash", (req, res) => {
  //esta es la sesion flash, la clave es mensaje
  res.json(req.flash("mensaje"));
});

// a traves de esta ruta enviamos el mensaje para la ruta de arriba
app.get("/crear-mensaje", (req, res) => {
  // se manda el nombre de la clave y luego su contenido
  req.flash("mensaje", "este es el mensaje flash de error");

  // para que sea efectivo, ahora redirijimos a la pagina donde queremos que se use el mensaje
  res.redirect("/mensaje-flash");
});

*/

app.get("/ruta");

// mapeamos las variables de entorno para asi poder conectar a la base de datos. Ver documentacion de dotenv para manejo de .env
require("dotenv").config();
require("./database/db");

// todo esto explicado en la documentacion de handlebars
const hbs = create({
  extname: ".hbs",
  // para poder trabajar con componentes y pegar codigo de hbs dentro de otro hbs
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

//middlewares,. se ejecutan antes de la respuesta al cliente. aqui ejecutamos la carpeta estatica public. Por esa razon la dejamos debajo de los get. este intersecta la ruta antes de la respuesta del cliente
app.use(express.static(__dirname + "/public"));

// cuando no son APIS y tratas con formularios, debes usar este middleware para poder leer lo que se envia a traves del formulario y manejar esos datos
app.use(express.urlencoded({ extended: true }));

// middleware para CSRF
app.use(csrf());
// si pasamos el token como middleware, se puede usar automaticamente en el login y register
app.use((req, res, next) => {
  // EL metodo locals, permite que al renderizar una pagina se envie el token csrf de seguridad. basicamente es crear variables globales en el proyecto
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash("mensajes");
  next();
});

// middleware para el home usando rutas
app.use("/", require("./routes/home"));

// middleware para el auth
app.use("/auth", require("./routes/auth"));

// asi llamamos al puerto que nos da el servidor, asi podemos poner como puerto de escucha algo dinamico
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Servidor andando " + PORT));
