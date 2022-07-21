//express router - ver documentacion

const express = require("express");
const {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
} = require("../controllers/homeController");
const {
  formPerfil,
  editarFotoPerfil,
} = require("../controllers/perfilController");
const urlValidar = require("../middlewares/urlValida");
const verificarUser = require("../middlewares/verificarUser");
const router = express.Router();

// obtener de la base de datos
// recuerda poner siempre el slash al inicio
router.get("/", verificarUser, leerUrls);

// agregar a la base de datos
router.post("/", verificarUser, urlValidar, agregarUrl);

//eliminar
router.get("/eliminar/:id", verificarUser, eliminarUrl);

// acceder menu editar
router.get("/editar/:id", verificarUser, editarUrlForm);

// editar en BD, por eso usamos el middleware
router.post("/editar/:id", verificarUser, urlValidar, editarUrl);

// perfil
router.get("/perfil", verificarUser, formPerfil);
router.post("/perfil", verificarUser, editarFotoPerfil);

//
router.get("/:shortURL", redireccionamiento);

module.exports = router;
