/* 
 gracias a serializeUser y deserializeUser en el index, en el objeto request (req) que pasa a traves de las rutas y sus middlewares o metodos llamados, obtendremos el userId y userName del usuario de la sesion actual
*/

//importamos nanoid para generar id unicos
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

// aqui en el controlador
//leemos la base de datos de forma asincrona obviamente
const leerUrls = async (req, res) => {
  //conectamos a la BD para leer los datos
  try {
    /* esperamos el modelo. el find es como un GET en  mongoose y puede recibir parametros para filtrar.

      esto nos trae un array de mongoose super complejo y usable, no uno de JS tradicional, por eso debemos usar elmetodo lean() para que devuelva algo mas basico, rapido y eficiente 
      
      gracias a serializer y demas explicado en la linea 1, podemos buscar solo las urls que esten asociadas al usuario de la sesion actual*/
    const urls = await Url.find({ user: req.user.id }).lean();

    res.render("home", { urls });
  } catch (err) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }

  /*   //simulando datos de base de datos
    const urls = [
      { origin: "www.google.com/daniel1", shortURL: "aksjdflkas1" },
      { origin: "www.google.com/daniel2", shortURL: "aksjdflkas2" },
      { origin: "www.google.com/daniel3", shortURL: "aksjdflkas3" },
    ]; */

  // le podemos mandar datos a la vista!
 /*  res.render("home", { urls: urls }); */
};

// agregamos
const agregarUrl = async (req, res) => {
  // recuereda  que debes activar el urlencoded en el index.js para poder manejar la data que se envia en los formularios
  const { origin } = req.body;

  try {
    // creamos una instancia de la clase creada en el MODELO de la aplicacion, sobre como debe ser el objeto a ser enviado por POST
    const url = new Url({ origin, shortURL: nanoid(8), user: req.user.id });

    // con save, el schema creado lo enviamos a la base de datos  usamos await para que espere a ser enviado
    await url.save();
    req.flash("mensajes", [{ msg: "URL agregada con exito!" }]);

    //redirigimos al inicio para que lea de nuevo la base de datos y pos cargue el nuevo
    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const eliminarUrl = async (req, res) => {
  const { id } = req.params;

  try {
    //usamos findbyidandDelete de Mongoose, ver documentacion
    /* await Url.findByIdAndDelete(id); */

    // eliminamos comprobando si el id de la sesion es el mismo del creador
    const url = await Url.findById(id);

    // metodo para comparar de mongoose
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url, no la puedes eliminar!");
    }

    // metodo del objeto mongoose para eliminar
    await url.remove();
    req.flash("mensajes", [{ msg: "URL agregada con exito!" }]);

    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const editarUrlForm = async (req, res) => {
  // sacamos los parametros del request para usarlos en el find de Mongoose y encontrarlo en la BD
  const { id } = req.params;
  try {
    // recuerda usar lean() para pasar el super objeto Mongoose a uno normal de javascript
    const url = await Url.findById(id).lean();

    // metodo para comparar de mongoose
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url, no la puedes editar!");
    }

    // devolvemos el objheto de la url
    res.render("home", { url });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

//editar ya en la base de datos, es el boton de editar url
const editarUrl = async (req, res) => {
  // sacamos los parametros del request para usarlos en el find de Mongoose y encontrarlo en la BD
  const { id } = req.params;
  const { origin } = req.body;
  try {
    // buscamos url del usuario
    const url = await Url.findById(id);

    // metodo para comparar de mongoose
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url, no la puedes eliminar!");
    }
    await url.updateOne({ origin });
    // ver documentacion. aqui necesitamos enviar el id y un objeto con lo que se modificara
    //await Url.findByIdAndUpdate(id, { origin });

    req.flash("mensajes", [{ msg: "URL editada con exito!" }]);

    // redirigimos para actualizar la pagina con los datos modificados
    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const redireccionamiento = async (req, res) => {
  // para que al colocar el short url, nos mande a la url original
  const { shortURL } = req.params;
  try {
    //recuerda usar los await para que espere a obtener ese dato o sino el dato tendra valor undefined
    const urlDB = await Url.findOne({ shortURL });
    res.redirect(urlDB.origin);
  } catch (err) {
    req.flash("mensajes", [{ msg: "No existe esta URL configurada" }]);
    return res.redirect("/auth/login");
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
};
