const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3001;

let storedPassword = null; 

app.get('/generate-password', (req, res) => {
    if (!storedPassword) {
        storedPassword = crypto.randomBytes(16).toString('hex');
        res.json({ success: true, message: 'Mot de passe généré et stocké.', password: storedPassword });
    } else {
        res.json({ success: false, message: 'Un mot de passe a déjà été généré.' });
    }
});

app.get('/retrieve-password', (req, res) => {
    if (storedPassword) {
        res.json({ success: true, message: "mot de passe stocké", password: storedPassword });
    } else {
        res.json({ success: false, message: "Aucun mot de passe n'a été généré." });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur 162.19.253.184${port}`);
});


