const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;

// Variable pour stocker le dernier token généré
let currentToken = null;

app.use(express.json());

// Accueil
app.get("/", (req, res) => {
  res.send("Bienvenue sur KeyRC Cloud Server!");
});

// Générer un nouveau token et le stocker
app.post("/generate-token", (req, res) => {
  if (!currentToken) {
    // Générer un token seulement s'il n'existe pas déjà
    currentToken = generateToken();
  }
  res.json({ token: currentToken });
});

// Fonction pour générer un token
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

// Démarrer le serveur
app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});
