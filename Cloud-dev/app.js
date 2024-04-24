const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;

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

app.post("/receive_ip", (req, res) => {
  const esp32IP = req.body.ip;
  const token = generateToken(); // Générer un nouveau token pour cet IP spécifique
  res.json({ ip: esp32IP, token: token });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});
