const express = require('express');
const cors = require('cors');

require('dotenv').config() // or import 'dotenv/config' if you're using ES6

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3l2kzzv.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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

    const recipeCollection = client.db("recipeDB").collection("recipes");
    const userCollection = client.db("recipeDB").collection("users");

    //user get api to get user profile from the "users" collection in the "recipeDB" database
    app.get('/users/', async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
    });

    //get user profile by id from the "users" collection in the "recipeDB" database
    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        res.send(result);
    });


    //delete user profile from the "users" collection in the "recipeDB" database
    app.delete('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
    });

    //single data update in user
    app.patch('/users', async (req, res) => {
      const {email, lastSignInTime} = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          lastSignInTime: lastSignInTime
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

    });

    
    //user post api to add user profile to the "users" collection in the "recipeDB" database
    app.post('/users', async (req, res) => {
        const userProfile = req.body;
        console.log(userProfile);
        const result = await userCollection.insertOne(userProfile);
        res.send(result);
    });


    //To get specific Recipe by id from the "recipes" collection in the "recipeDB" database
    app.get('/recipes/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await recipeCollection.findOne(query);
        res.send(result);
    });


     //Get a list of Recipe from the "recipes" collection in the "recipeDB" database
    app.get('/recipes', async (req, res) => {
        const result = await recipeCollection.find().toArray();
        res.send(result);

    });

    //Add a new Recipe to the "recipes" collection in the "recipeDB" database
    app.post('/addRecipes', async (req, res) => {
      const newRecipes = req.body;
      console.log(newRecipes);
      const result = await recipeCollection.insertOne(newRecipes);
      res.send(result);
    });

    //Delete a recipe from the "recipes" collection in the "recipeDB" database
    app.delete('/recipes/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }; //make sure to import ObjectId from mongodb
        const result = await recipeCollection.deleteOne(query);
        res.send(result);
    });


    //Update a recipe in the "recipes" collection in the "recipeDB" database
        app.put('/recipes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedRecipe = req.body;
            
            const recipe = {
                $set: {
                    title: updatedRecipe.title,
                    image: updatedRecipe.image,
                    cuisineType: updatedRecipe.cuisineType,
                    preparationTime: updatedRecipe.preparationTime,
                    categories: updatedRecipe.categories,
                    ingredients: updatedRecipe.ingredients,
                    instructions: updatedRecipe.instructions
                }
            }
            
            const result = await recipeCollection.updateOne(filter, recipe, options);
            res.send(result);
        });
        const { ObjectId } = require('mongodb');

        // PATCH route to update likeCount
        app.patch('/recipes/:id', async (req, res) => {
            const id = req.params.id;
            const { likeCount } = req.body;
            
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    likeCount: likeCount
                },
            };

            try {
                const result = await recipeCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to update like count", error });
            }
        });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('recipes Server is running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});