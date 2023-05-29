const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2cofc5d.mongodb.net/?retryWrites=true&w=majority`;

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
const usersDb = client.db("bistroDb").collection("users");
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
      const query = { _id: new ObjectId(id) };
      const result = await cartDb.deleteOne(query);
      res.send(result);
    });

    // user data base

    // get all users
    app.get("/users", async (req, res) => {
      const result = await usersDb.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const query = { email: userData.email };
      const existingUser = await usersDb.findOne(query);
      if (existingUser) {
        console.log("existing User", existingUser);
        return res.send({ message: "User already exist" });
      }
      const result = await usersDb.insertOne(userData);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersDb.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersDb.deleteOne({ _id: new ObjectId(id) });
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
