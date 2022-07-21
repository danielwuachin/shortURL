document.addEventListener("click", (e) => {
  if (e.target.dataset.short) {
    const url = `http://localhost:5000/${e.target.dataset.short}`;

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
