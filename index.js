const express = require("express");
const { create } = require("express-handlebars");
const app = express();

// todo esto explicado en la documentacion de handlebars
const hbs = create({
  extname: ".hbs",
  // para poder trabajar con componentes y pegar codigo de hbs dentro de otro hbs
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

//middlewares,. se ejecutan antes de la respuesta al cliente. aqui ejecutamos la carpeta estatica public. Por esa razon la dejamos debajo de los get
app.use(express.static(__dirname + "/public"));

// middleware para el home usando rutas
app.use("/", require("./routes/home"));

// middleware para el auth
app.use("/auth", require("./routes/auth"));

app.listen(5000, () => console.log("Servidor andando"));
