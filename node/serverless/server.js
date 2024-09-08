const express = require("express");
const path = require("path");

const app = express();
const port = 8888; // Você pode escolher qualquer porta

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // Ou o nome do seu arquivo HTML principal
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
