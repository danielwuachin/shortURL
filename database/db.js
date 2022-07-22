const mongoose = require("mongoose");
//recuerda el .config
require('dotenv').config()
// nos conectamos a la base de datos usando los datos de la variable de entorno. Esto es una promesa y puedes usarla para manejar el OK o el error
//exportamos la conexion para usarla en el index.js
const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log("db conectada 🔥");
        return m.connection.getClient();
    })
    .catch((e) => console.log("falló la conexión " + e));

module.exports = clientDB;
// nos conectamos a la base de datos usando los datos de la variable de entorno. Esto es una promesa y puedes usarla para manejar el OK o el error
mongoose
  .connect(process.env.URI)
  .then(() => console.log("db conectada �"))
  .catch(() => "fallo la conexion " + error);
