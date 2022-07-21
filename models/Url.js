// crearemos los schemas, que es como definir el tipo de datos de la tabla, creo
const mongoose = require("mongoose");

// asi definimos los Schemas, es una clase
const { Schema } = mongoose;

//definimos las propiedades de la clase Schema
const urlSchema = new Schema({
  origin: {
    type: String,
    unique: true,
    required: true,
  },
  shortURL: {
    type: String,
    unique: true,
    required: true,
    // usamos el paquete instalado para generar id llamado nanoid, desde el controlador que envia la data porque sino da error de datos duplicados
  },

  // agregamos una referencia que es como una relacion o foreign key en SQL
  user: {
    // sera tipo id como el que se crea al crear un usuario, y a partir de la sesion sacamos ese valor de Id a usar
    type: Schema.Types.ObjectId,
    // nombre del modelo user
    ref: "User",
    required: true,
  },
});

// asi creamos nuestros modelos (tablas en SQL), mongoose nos cambiara el nombre a plural, y adicional le pasamos el esquema de como sera
const Url = mongoose.model("Url", urlSchema);

//exportamos
module.exports = Url;
