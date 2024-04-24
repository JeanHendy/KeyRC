const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;

// Variable pour stocker le token
let currentToken = null;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bienvenue sur KeyRC Cloud Server!");
});

// Point de terminaison pour générer et récupérer le token
app.post("/generate-token", (req, res) => {
  // Générer un token seulement s'il n'existe pas déjà
  if (!currentToken) {
    currentToken = generateToken();
  }
  res.json({ token: currentToken });
});

function generateToken() {
  return crypto.randomBytes(8).toString("hex");
}

// Point de terminaison pour récupérer le token existant
app.post("/receive_ip", (req, res) => {
  const esp32IP = req.body.ip;
  // Assurez-vous qu'il y a un token existant à envoyer
  if (!currentToken) {
    return res
      .status(404)
      .send("Token not found. Please generate token first.");
  }
  res.json({ ip: esp32IP, token: currentToken });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});
