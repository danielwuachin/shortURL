const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    lowercase: true,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
  tokenConfirm: {
    type: String,
    default: null,
  },
  cuentaConfirmada: {
    type: Boolean,
    default: false,
  },
  imagen: {
    type: String,
    default: null,
  },
});

/* mongoose tiene un metodo llamado pre() el cual hace cosas previas a hacer algo (por ejemplo hashear antes de guardar) 

se usan functions normales para poder acceder a la propiedad this y asi hacer referencia a cada propiedad del schema (userName, password, etc) 

next() hace referencia a que ya hizo el pre y que debe hacer lo que se iba a hacer realmente (en este caso el metodo save()*/
userSchema.pre("save", async function (next) {
  const user = this;

  //solo hashea cuando se cambia o crea la contrasena
  if (!user.isModified("password")) return next();

  try {
    // cada salto es un salto de palabras aleatorio, asi ni nosotros podremos descifrar la password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    // guardamos la contrasena con el hash
    user.password = hash;

    //por ultimo si todo sale bien, que siga con la operacion
    next();
  } catch (error) {
    console.log(error);
    throw new Error("ERROR al procesar la contrasena");
  }
});

// para confirmar contrasena al iniciar sesion
userSchema.methods.comparePassword = async function (canditePassword) {
  // esto es de la documentacion de bcrypt para confirmar si coinciden passwords hasheadas
  // pasamos la contrasena a comparar, y el this.password en este caso es la de la BD gracias a que el this hace referencia al Schema en si
  return await bcrypt.compare(canditePassword, this.password);
};

//con esto se crea el schema en la base de datos. RECUERDA, que mongoose automaticamente pasa todo a plural y minusculas al crear la coleccion en la BD, por eso quedara una coleccion llamada users
module.exports = mongoose.model("User", userSchema);
