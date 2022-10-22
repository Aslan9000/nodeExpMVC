const dotenv = require('dotenv');
dotenv.config();

// const {MongoClient} = require('mongodb');

// const client = new MongoClient(process.env.CONNECTIONSTRING);

// async function start(){
//     await client.connect();
//     module.exports = client;
//     const app = require('./app');
//     app.listen(process.env.PORT);
// }

// start();


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function start(){
    await client.connect();
    module.exports = client;
    const app = require('./app');
    app.listen(process.env.PORT);
}

start();
