/**
 * recuerda enviar el token csrf de seguridad a las paginas que lo necesiten al renderizar
 */

const User = require("../models/User");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
// usamos al final .config porque no le cambiamos el nombre al archivo .env
require("dotenv").config;

const registerForm = (req, res) => {
  // no olvides cargar los flash al momento de renderizar
  res.render("register");
};

const loginForm = (req, res) => {
  // renderizamos el login y le mandamos si hay mensajes flash de error, la clave de esa session flash de errores es mensajes
  res.render("login");
};

// recuerda que siempre que consultes una BD hacerlo async
const registerUser = async (req, res) => {
  // confirmamos las validaciones hechas en el auth.js(ruta) del express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    //comprobamos si el usuario con ese email ya existe
    let user = await User.findOne({ email: email });
    if (user) throw new Error("ya existe el usuario");

    // como el rol no esta en el Schema, no se envia, por eso los schema son utiles para no enviar cosas raras y hacer las validaciones automaticamente
    user = new User({ userName, email, password, tokenConfirm: nanoid() });

    //como User es un objeto Mongoose poderoso (con metodos incorporados) al asignarle a user ese valor, podemos usar metodos como el save()
    await user.save();

    // enviar correo con la confirmacion de la cuenta
    // con mailtrap tendremos un servidor para probar el envio de correo electronico, usamos variables de entorno para asegurar usuario y contrasena
    var transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        //usamos libreria dotenv para esto
        user: process.env.userEmail,
        pass: process.env.passEmail,
      },
    });

    // enviar emial ya teniendo la configuracion del transport
    let info = await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // enviador
      to: user.email, // quienes reciben, el usuario que se esta registrando
      subject: "Hello ✔", // asunto
      // text: "Hello world?", body en texto
      html: `<a href="${
        process.env.PATHHEROKU || "http://localhost:5000/"
      }auth/confirmar/${
        user.tokenConfirm
      }">verifica tu cuenta dando click aqui!</a>`, // body en html
    });

    //redirigimos al login para que pueda iniciar sesion y a su vez un mensaje flash para recordarle
    req.flash("mensajes", [
      {
        msg: "Revisa tu bandeja de entrada y entra al link que te enviamos para poder validar tu cuenta!",
      },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);

    // en vez de retornar algo, retornamos hacia la misma pagina pero con los mensajes flash de error cargados
    return res.redirect("/auth/register");
  }
};

const confirmarCuenta = async (req, res) => {
  // obtenemos el token que el usuario manda por la url que le llego al correo
  const { token } = req.params;

  // buscamos si el usuario existe en la BD
  try {
    //recuerda siempre poner tu await para que no se guarde como undefined
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe el usuario");

    // si el usuario existe y se confirmo el token, entonces lo colocamos como un usuario confirmado y eliminamos el token de confirmacion para que no lo reusen
    user.cuentaConfirmada = true;
    user.tokenConfirm = null;

    // guardamos en la BD
    await user.save();

    // redirigimos al login informando que su cuenta ya fue verificada
    req.flash("mensajes", [
      {
        msg: "Tu cuenta ha sido verificada, ya puedes iniciar sesion!",
      },
    ]);
    res.redirect("/auth/login");
  } catch (err) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

// hacer login y comprobar que existe el usuario
const loginUser = async (req, res) => {
  // errores del validator
  const errors = validationResult(req);

  //en caso de que haya error
  if (!errors.isEmpty()) {
    // asi solo devolvemos el mensaje flash del error
    req.flash("mensajes", errors.array());

    // en vez de retornar algo, retornamos hacia la misma pagina pero con los mensajes flash de error cargados
    return res.redirect("/auth/login");
    /*     // EL array() pasa las respuestas a un array de objetos
    return res.json(errors.array()); */
  }
  // extraemos la data del formulario
  const { email, password } = req.body;

  try {
    // confirmamos que existe el usuario en la DB
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe este email");

    //confirmamos que la cuenta ya se confirmo
    if (!user.cuentaConfirmada)
      throw new Error(
        "Falta confirmar la cuenta, por favor revise la bandeja de entrada de su email"
      );

    // vemos si coincidenlas contrasenas
    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña incorrecta");

    // como ya el usuario verificado se valido que existe (y es user) podemos usar passport para crear la sesion de usuario a traves de passport. gracias a esto al usar serializeUser se puede usar el objeto user!!
    req.login(user, function (err) {
      if (err) throw new Error("Error al crear la sesion");
      // lo mandamos al home autenticado
      return res.redirect("/");
    });
  } catch (error) {
    // usamos el objeto de error de mensajes flash, una de sus claves es msg y esta tambien devuelve los errores del throw new Error
    req.flash("mensajes", [{ msg: error.message }]);

    // en vez de retornar algo, retornamos hacia la misma pagina pero con los mensajes flash de error cargados
    return res.redirect("/auth/login");
  }
};

// cerrar seison
const cerrarSesion = (req, res) => {
  // ya esto viene del passport automaticamente en version 0.6.0 require un callback para el error
  req.logout((err) => {
    if (err) return next(error);
    else return res.redirect("/auth/login");
  });
};

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
