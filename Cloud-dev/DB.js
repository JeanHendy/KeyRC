const {MongoClient}=require('mongodb')

async function connectToDatabase(url, dbName) {
    try {
        // Se connecter à la base de données
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
        await client.connect()
        console.log('Connexion à MongoDB réussie')

        // Sélectionner la base de données
        const db = client.db(dbName)

        return db // Retourner l'objet de connexion à la base de données
    } catch (error) {
        console.error('Erreur de connexion à MongoDB', error)
        throw error // Lancer une erreur si la connexion échoue
    }
}

async function startServer(){
    const database= await connectToDatabase('mongodb://localhost:27017', 'KeyRC')
    const collection1=database.collection('Administrators')
    const collection2=database.collection('Locks')
    const collection3=database.collection('Tokens')
    return {collection1, collection2, collection3}
}


async function lastGeneratedToken(collection3, adminId) {
    try {
        let query = {}; // Requête de recherche par défaut (tous les documents)
        if (adminId) {
            query.adminId = adminId; // Si adminId est spécifié, recherche par adminId
        }

        const result = await collection3.find(query).sort({ "token.token_created": -1 }).limit(1).toArray();
        if (result.length > 0) {
            return result[0].token.token;
        } else {
            return null; // Aucun token trouvé
        }
    } catch (error) {
        console.error("Error retrieving the last token generated :", error);
        throw error;
    } 
}



module.exports={connectToDatabase, startServer, lastGeneratedToken}