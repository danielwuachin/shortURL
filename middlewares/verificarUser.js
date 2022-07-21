module.exports = (req, res, next) => {
  //el requuest ya viene con los metodos del passport
  // este sirve para saber si el usuario tiene una sesion activa
  if (req.isAuthenticated()) {
    return next();
  }

  //si no tiene sesion activa, lo mandamos a iniciar sesion de nuevo
  res.redirect("/auth/login");
};
