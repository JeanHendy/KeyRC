const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bienvenue sur KeyRC Cloud Server!");
});

app.post("/generate-token", (req, res) => {
  const token = generateToken();
  res.json({ token: token });
});

function generateToken() {
  const token = crypto.randomBytes(8).toString("hex");
  return token;
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));

// Point de terminaison POST pour recevoir l'adresse IP de l'ESP32
app.post('/receive_ip', (req, res) => {
const esp32IP = req.body.ip;
// Envoyer le token en réponse
res.send(token);
// Vous pouvez enregistrer le token ou effectuer d'autres actions avec l'adresse IP
// Par exemple, enregistrer le token avec l'adresse IP dans une base de données
});
