const { MongoClient, ServerApiVersion } = require('mongodb');
const dbName = process.env.MONGO_DATABASE;
const dbCollect = process.env.MONGO_DATABASE;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

async function saveData(data) {
  try {
    await client.connect();
    await client.db(dbName).collection(dbCollect).insertOne(data);
  } finally {
    // await client.close();
  }
}

async function findData(filter = {}) {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).find(filter).limit(1).toArray();
    return data.length ? data[0] : null;
  } finally {
    // await client.close();
  }
}

async function findLastData(sort = {}) {
  try {
    await client.connect();
    const data = await client.db(dbName).collection(dbCollect).find().sort(sort).limit(1).toArray();
    return data.length ? data[0] : null;
  } finally {
    // await client.close();
  }
}

module.exports.saveData = saveData;
module.exports.findData = findData;
module.exports.findLastData = findLastData;
