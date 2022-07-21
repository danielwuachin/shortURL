const mongoose = require("mongoose");

// nos conectamos a la base de datos usando los datos de la variable de entorno. Esto es una promesa y puedes usarla para manejar el OK o el error
mongoose
  .connect(process.env.URI)
  .then(() => console.log("db conectada �"))
  .catch(() => "fallo la conexion " + error);
