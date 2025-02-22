require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function conectarAoBanco() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB Atlas!");
        return client.db("spaceBoss");
    } catch (erro) {
        console.error("Erro ao conectar ao MongoDB:", erro);
        throw erro;
    }
}

module.exports = { conectarAoBanco }; 