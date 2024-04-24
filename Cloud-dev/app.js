const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;

let currentToken = null; // Variable pour stocker le dernier token généré

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bienvenue sur KeyRC Cloud Server!");
});

// Générer un nouveau token et le stocker
app.post("/generate-token", (req, res) => {
  currentToken = crypto.randomBytes(8).toString("hex"); // Générer un nouveau token
  res.json({ token: currentToken }); // Envoyer ce nouveau token
});

// Permettre à l'ESP32 de récupérer le dernier token généré
app.get("/get-token", (req, res) => {
  if (currentToken) {
    res.json({ token: currentToken });
  } else {
    res.status(404).send("No token available. Generate token first.");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});
