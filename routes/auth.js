const express = require("express");
// para validaciones
const { body } = require("express-validator");

const {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
} = require("../controllers/authController");
const router = express.Router();

// el middleware del index agrega el /auth al URL, y aqui le ponemos el resto, quedando en localhost/auth/register. luego, la funcion que pasamos ejecuta un res.render() que dentro tiene el nombre de la vista que va a renderizar (ver authController)
router.get("/register", registerForm);

// mandar datos del usuario
router.post(
  "/register",
  [
    //middlewares, si usas varios los llamas en un array
    /* 
  express validator tiene eMUCHOS metodos para usar, como por ejemplo trim() para limpiar espacios en blanco o escape para que solo mande texto y no h1 o cosas especiales 

  las claves son los nombres de inputs en el formulario

  luego para que continue la ejecucion y mande las cosas sin validar, usamos validationResult en el controlador
   */

    body("userName", "Ingrese un nombre valido").trim().notEmpty().escape(),
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña de minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.repassword) {
          throw new Error("No coinciden las contraseñas");
        } else {
          // si no hay error, devuelve el valor sin problemas
          return value;
        }
      }),
  ],
  registerUser
);

// este es el link que enviariamos al correo del usuario para que confirme su correo
router.get("/confirmar/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post(
  "/login",
  [
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña de minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape(),
  ],

  loginUser
);

router.get("/logout", cerrarSesion);

module.exports = router;
