const express=require('express')
const bodyParser=require('body-parser')
const fs=require('fs')
const QR_code=require('qrcode')
const {success, getUniqueId, generateToken, createImage_QRcode}=require('./helper.js')
let qrcodes=require('./mock-qrcode')

const app=express()
const port=3000

app.use(bodyParser.json())

app.get('/exemple',(req, res) => res.send('Mon premier test !'))

// Affiche l'ensemble des infos des QR codes présents dans mock-qrcode
app.get('/qrcodes', (req, res) => {
    const message='La liste de tous les QR codes a bien ete recuperee !'
    res.json(success(message, qrcodes))
})

//Affiche les infos d'un QR code dont on connaît l'id
app.get('/qrcodes/:id', (req, res) => {
    const id=parseInt(req.params.id)
    const qrcode=qrcodes.find(qrcode => qrcode.id===id)
    const message=`Un QR code a bien été trouvé`
    res.json(success(message, qrcode))
})

//Affiche le QR code sous format image
app.get('/qrcodes/:id/image_QRcode', async (req, res) => {
    const id = parseInt(req.params.id)
    const qrcode = qrcodes.find(qrcode => qrcode.id === id)
    if (!qrcode.token) {
        return res.status(500).send("Aucun token n'a été généré pour le QR code sélectionné")
    }
    try {
        const image_QRcode = await QR_code.toDataURL(qrcode.token)
        res.send(`<img src="${image_QRcode}" alt="QR code">`)
    } catch (error) {
        console.error("Erreur lors de la génération de l'image QR code :", error)
        res.status(500).send("Erreur lors de la génération de l'image QR code")
    }
})


//Crée un QR code (token) et l'associe à un utilisateur
app.post('/qrcodes', (req, res) => {
    const id=getUniqueId(qrcodes)
    const token=generateToken()
    const qrcodeCreated={...req.body, ...{id: id, created: new Date(), token: token}}
    qrcodes.push(qrcodeCreated)
    const message=`Le QR code de ${qrcodeCreated.nom} a bien été crée`
    res.json(success(message, qrcodeCreated))
})

//Modifie les infos d'un QR code
app.put('/qrcodes/:id', (req, res) => {
    const id=parseInt(req.params.id)
    const qrcodeUpdated={...req.body, id: id}
    qrcodes=qrcodes.map(qrcode => {
        return qrcode.id===id ? qrcodeUpdated:qrcode 
    })
    const message=`Le QR code de ${qrcodeUpdated.nom} a bien été modifié`
    res.json(success(message, qrcodeUpdated))
})

//Supprime un QR code
app.delete('/qrcodes/:id', (req, res) => {
    const id=parseInt(req.params.id)
    const qrcodeDeleted=qrcodes.find(qrcode => qrcode.id===id)
    qrcodes=qrcodes.filter(qrcode => qrcode.id !== id)
    const message=`Le QR code de ${qrcodeDeleted.nom} a bien été supprimé`
    res.json(success(message, qrcodeDeleted))
})

app.listen(port, () => console.log(`Mon application est sur : http://localhost:${port}`))
