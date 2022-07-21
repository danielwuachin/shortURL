const formidable = require("formidable");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

module.exports.formPerfil = async (req, res) => {
  //para cargar el perfil
  try {
    const user = await User.findById(req.user.id);
    return res.render("perfil", { user: req.user, imagen: user.imagen });
  } catch (error) {
    req.flash("mensajes", [{ msg: "error al leer el usuario" }]);
    return res.redirect("/perfil");
  }
  res.render("perfil");
};

module.exports.editarFotoPerfil = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.maxFileSize = 50 * 1024 * 1024;

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("recuerda que debes subir un archivo de tipo imagen");
      }

      const file = files.myFile;

      if (file.originalFilename === "") {
        throw new Error("por favor, agrega una imagen");
      }

      // validar el mimetype
      const imageTypes = ["image/jpeg", "image/png"];
      if (!imageTypes.includes(file.mimetype)) {
        throw new Error("por favor, agrega una imagen en formato .jpg u .png");
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("por favor, agrega una imagen de menos de 5MB");
      }

      // para acceder a la extension jpeg o png del image/png
      const extension = file.mimetype.split("/")[1];

      // recuerda que al tener al usuario verificado, siempre tendremos acceso a sus datos en el req.user
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );

      // creamos el archivo en el servidor (NO ES LA BD), modificando el anterior(o vacio) por algo que existe(el nuevo). al tener mismo nombre, se sobreescriben
      //dirFile es donde se encuentra el archivo en este momento
      fs.renameSync(file.filepath, dirFile);

      //jimp para editar la imagen, en este caso redimencionar
      const image = await Jimp.read(dirFile);
      //con esto guardamos la imagen nuevamente pero ya editada
      image.resize(200, 200).quality(90).writeAsync(dirFile);

      const user = await User.findById(req.user.id);

      // es el mismo nombre que el nombre que le pusimos al archivo en el servidor
      user.imagen = `${req.user.id}.${extension}`;

      // super save() de mongoose
      await user.save();

      req.flash("mensajes", [{ msg: "Imagen subida correctamente" }]);
    } catch (err) {
      req.flash("mensajes", [{ msg: err.message }]);
    } finally {
      return res.redirect("/perfil");
    }
  });
};
