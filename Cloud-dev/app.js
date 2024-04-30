const express=require('express')
const {ObjectId}=require('mongodb')
const bodyParser=require('body-parser')
const crypto=require('crypto') 
const { startServer, lastGeneratedToken } = require('./DB.js')
const {Administrator, Lock, Token} = require('./model.js')

const app=express()
const port=3000

//Donne accès au corps de la requête avec req.body
app.use(bodyParser.json())

//Fonctions
const success=(message, data) => {
    return{message, data}
}
const generateToken = () => {
    const token_created=new Date() //Date de la création du token
    const token=crypto.randomBytes(8).toString('hex')
    return {token, token_created: token_created }
}

// Accueil
app.get("/", (req, res) => {
    res.send("Bienvenue sur KeyRC Cloud Server!");
  });

//Ajoute des données à la collection Administrators avec infos de la serrure(hypothèse faite pour 1ère connexion)
startServer(database).then(({collection1, collection2, collection3}) => {
    app.post('/api/KeyRC/admin', async (req, res) => {
    try {
        const admin= new Administrator(req.body.name, req.body.email, req.body.password)
        const Administrators_collection= await collection1.insertOne(admin)
        
        const adminId = Administrators_collection.insertedId
        const lastToken = await lastGeneratedToken(collection3, adminId)
        const lock= new Lock(adminId, req.body.location, lastToken)
        const Locks_collection= await collection2.insertOne(lock)
        res.status(201).json({Administrators_collection, Locks_collection})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})

//Ajoute des données à la collection Locks
startServer(database).then(({collection1, collection2, collection3}) => {
    app.post('/api/KeyRC/lock/:id', async (req, res) => {
    try {
        const id=new ObjectId(req.params.id)
        const lastToken = await lastGeneratedToken(collection3, id)
        const lock= new Lock(id, req.body.location, lastToken)
        const Locks_collection= await collection2.insertOne(lock)
        res.status(201).json((Locks_collection))
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})

//Ajoute des données à la collection Tokens
startServer(database).then(({collection1, collection2, collection3}) => {
    app.post('/generate-token', async (req, res) => {
    const token=generateToken()
    try {
        const id=new ObjectId()
        const Token_current= new Token(id, token)
        const Tokens_collection= await collection3.insertOne(Token_current)
        res.status(201).json((Tokens_collection))
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})


//Affiche l'ensemble des données présentes dans la BD
startServer(database).then(({collection1, collection2, collection3}) => {
    app.get('/api/KeyRC/all-stuff', async (req, res) => {
        try {
            const Administrators_collection= await collection1.find().toArray()
            const Locks_collection= await collection2.find().toArray()
            const Tokens_collection= await collection3.find().toArray()
            if(Administrators_collection.length > 0 && Locks_collection.length > 0 && Tokens_collection.length > 0){
                res.status(200).json(({Administrators_collection, Locks_collection, Tokens_collection}))
            }else{
                res.status(204).json("No administrator found.")
            }
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1)
})

//Affiche l'ensemble des données d'un administrateur dont on connaît l'id
startServer(database).then(({collection1, collection2, collection3}) => {
    app.get('/api/KeyRC/stuff/:id', async (req, res) => {
        const id=new ObjectId(req.params.id)
        try {
            const Administrators_collection= await collection1.findOne({_id: id}).toArray()
            const Locks_collection= await collection2.findOne({adminId: id}).toArray()
            const Tokens_collection= await collection3.findOne({adminId: id}).toArray()
            if(Administrators_collection.length > 0 && Locks_collection.length > 0 && Tokens_collection.length > 0){
                res.status(200).json(({Administrators_collection, Locks_collection, Tokens_collection}))
            }else {
                res.status(204).json("This administrator does not exist.")
            }
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1)
})


//Modifie les données d'un administrateur 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.put('/api/KeyRC/admin/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            const {name, email, password} = req.body
            const administratorUpdated= new Administrator(name, email, password)
            const Administrators_collection= await collection1.updateOne({_id: id}, {$set: administratorUpdated})
            if (Administrators_collection.matchedCount === 0) {
                res.status(404).json("No administrator found for this ID.");
            }
            res.status(200).json(success("This is the updated administrator : ", Administrators_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})
//Modifie les données d'un token 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.put('/api/KeyRC/token/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            let Token_current 
            const tokenExist= await collection3.findOne({adminId: id})
            if(!tokenExist.token){
                Token_current=generateToken()
            }else{
                Token_current=tokenExist.token
            }
            const tokenUpdated= new Token(id, Token_current)
            const Tokens_collection= await collection3.updateOne({adminId: id}, {$set: tokenUpdated})

            const lastToken = await lastGeneratedToken(collection3, id)
            if (!lastToken) {
                console.log("Need no modified")
            }
            const Locks_collection= await collection2.updateOne({adminId: id}, {$set: {lastToken:lastToken}})
            if (Tokens_collection.matchedCount === 0 && Locks_collection.matchedCount === 0) {
                res.status(404).json("No token found for this ID.");
            }
            res.status(200).json(success("This is the updated token : ", Tokens_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})
//Modifie les données d'une serrure 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.put('/api/KeyRC/lock/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            const {location} = req.body
            const lastToken = await lastGeneratedToken(collection3, id)            
            const lockUpdated= new Lock(id, location, lastToken)
            const Locks_collection= await collection2.updateOne({adminId: id}, {$set: lockUpdated})
            if (Locks_collection.matchedCount === 0) {
                res.status(404).json("No lock found for this ID.");
            }
            res.status(200).json(success("This is the updated lock : ", Locks_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})

//Supprime les données d'un administrateur 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.delete('/api/KeyRC/admin/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            const Administrators_collection= await collection1.deleteOne({_id: id})
            res.status(200).json(success("This is the deleted administrator : ", Administrators_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})
//Supprime les données d'un token 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.delete('/api/KeyRC/token/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            const Tokens_collection= await collection3.deleteOne({_id: id})
            res.status(200).json(success("This is the deleted token : ", Tokens_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})
//Supprime les données d'une serrure 
startServer(database).then(({collection1, collection2, collection3}) => {
    app.delete('/api/KeyRC/lock/:id', async (req, res) => {
        try {
            const id=new ObjectId(req.params.id)
            const Locks_collection= await collection2.deleteOne({_id: id})
            res.status(200).json(success("This is the deleted lock : ", Locks_collection))
        } catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})

// Récupère le dernier token généré 
startServer(database).then(({collection, collection2, collection3}) => {
    app.get('/receive_ip', async (req, res) => {
        try {
            const esp32IP = req.body.ip
            const lastToken = await lastGeneratedToken(collection3)
            if (lastToken) {
                res.status(200).json({ip:esp32IP, lastToken: lastToken})
            } else {
                res.status(404).json("No token found.")

        }} catch (error) {
            console.log(error) 
            res.status(500).json(error)
        }
    })
}).catch(error => {
    console.error("Error when starting the server :", error)
    process.exit(1) // Quitter le processus avec un code d'erreur
})



app.listen(port, () => console.log(`My API is on : http://0.0.0.0:${port}`))