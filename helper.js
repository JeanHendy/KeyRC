const QR_code=require('qrcode')
const path=require('path')
let qrcodes=require('./mock-qrcode')

exports.success=(message, data) => {
    return{message, data}
}

exports.getUniqueId=(qrcodes) => {
    const qrcodesId=qrcodes.map((qrcode) => qrcode.id)
    const maxId=qrcodesId.reduce((a,b) => Math.max(a,b))
    const uniqueId=maxId+1
    return uniqueId
}

exports.generateToken = () => {
    // Caractères possibles pour le token (chiffres et lettres)
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const tokenLength = 12 // Longueur du token souhaitée
    //const token_created=new Date() //Date de la création du token
    let token = '' // Initialisez une variable pour stocker le token généré

    // Boucle pour générer chaque caractère du token
    for (let i = 0; i < tokenLength; i++) {
        // Générer un index aléatoire pour sélectionner un caractère de la liste des caractères possibles
        const randomIndex = Math.floor(Math.random() * characters.length)
        token += characters[randomIndex] // Concaténer le caractère sélectionné au token
    }
    return token
}

exports.LastGeneratedToken= () => {
    let lastToken = ''
    let lastTokenDate = new Date(0) // Initialisation de la date à la plus ancienne possible

    // Parcours chaque QR code dans le fichier "mock-qrcode.js"
    qrcodes.forEach(qrcode => {
        if (qrcode.token && qrcode.token_created > lastTokenDate) {
            lastToken = qrcode.token // Mise à jour du dernier token trouvé
            lastTokenDate = qrcode.token_created // Mise à jour de la date de création du dernier token trouvé
        }
    })
    return lastToken
}
