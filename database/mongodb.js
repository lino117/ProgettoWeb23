
const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://jinclaudio:Keqingyyds123.@claudiomongo.3ulb5gw.mongodb.net/?retryWrites=true&w=majority";
const dipUri='mongodb://site222320:[aiRaeWe2]@mongo_site222320?writeConcern=majority';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(dipUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connect() {
    const client = await MongoClient.connect(dipUri, { useUnifiedTopology: true });
    return client.db('ProgettoTW');
}

module.exports = connect;