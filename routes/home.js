//express router - ver documentacion

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  //simulando datos de base de datos
  const urls = [
    { origin: "www.google.com/daniel1", shortURL: "aksjdflkas1" },
    { origin: "www.google.com/daniel2", shortURL: "aksjdflkas2" },
    { origin: "www.google.com/daniel3", shortURL: "aksjdflkas3" },
  ];

  // le podemos mandar datos a la vista!
  res.render("home", { urls: urls });
});

module.exports = router;
