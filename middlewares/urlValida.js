/* para validar las url enviadas en post.

el nombre puede ser cualquiera

el parametro next es para que al usarlo en el index.js, este se ejecute y luego ejecute la funcion siguiente a el (por ejemplo la de agregarUrl)

URL es propio de node*/
const { URL } = require("url");

const urlValidar = (req, res, next) => {
  try {
    //tomamos la data del formulario
    const { origin } = req.body;

    // URL tiene su propia propiedad llamada origin,
    const urlFrontend = new URL(origin);

    // si urlFrontend es distinto a null (se debe colocar entre comillas) se ejecuta
    if (urlFrontend !== "null") {
      // verificamos que el link a acortar tenga un metodo http
      if (
        urlFrontend.protocol === "http:" ||
        urlFrontend.protocol === "https:"
      ) {
        return next();
      }
      throw new Error("La URL debe contener http: u https:");
    }
    throw new Error("La URL no es valida");
  } catch (error) {
    if (error.message === "Invalid URL") {
      req.flash("mensajes", [{ msg: "La URL no es valida" }]);
    } else {
      req.flash("mensajes", [{ msg: error.message }]);
    }

    // en vez de retornar algo, retornamos hacia la misma pagina pero con los mensajes flash de error cargados
    return res.redirect("/");
  }
};

module.exports = urlValidar;
