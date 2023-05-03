
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jinclaudio:Keqingyyds123.@claudiomongo.3ulb5gw.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connect() {
    const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const db = client.db('ProgettoTW');
    return db;
}

module.exports = connect;