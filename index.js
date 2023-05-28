const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://Bistro-Boss:ccicrWaxVWb3uIi7@cluster0.2cofc5d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const bistroDb = client.db("bistroDb").collection("menu");
const cartDb = client.db("bistroDb").collection("cart");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    app.get("/menu", async (req, res) => {
      const cursor = bistroDb.find({});
      const menu = await cursor.toArray();
      res.send(menu);
    });

    app.post("/cart", async (req, res) => {
      const cart = req.body;
      console.log("hit the cart", cart);
      const result = await cartDb.insertOne(cart);
      console.log(result);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const query = req.query.email ? { email: req.query.email } : {};
      const cursor = cartDb.find(query);
      const cart = await cursor.toArray();
      res.send(cart);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartDb.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
