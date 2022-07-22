document.addEventListener("click", (e) => {
  if (e.target.dataset.short) {
    // asi obtenemos la url actual con origin
    const url = `${window.location.origin}/${e.target.dataset.short}`;

    // objeto del navegador clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.log("algo salio mal...", err);
      });
  }
});
