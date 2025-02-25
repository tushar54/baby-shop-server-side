require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.aiyzp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const Shop = client.db('BabyShop').collection('Shop')
        const Cart = client.db('BabyShop').collection('Cart')
        const Category = client.db('BabyShop').collection('Category')

        app.get('/Cribs', async (req, res) => {
            const query = { category: 'Sleeping' }
            const result = await Shop.find(query).toArray()
            res.send(result)
        })
        app.get('/Carriage', async (req, res) => {
            const query = { category: 'Strollers & Carriages' }
            const result = await Shop.find(query).toArray()
            res.send(result)
        })
        app.post("/cart", async (req, res) => {
            try {
                const data = req.body
                const id = req.body.productId
                const query = { productId: id }
                const result1 = await Cart.findOne(query)
                if (result1) {
                    return res.status(401).send({ messege: 'already exist' })
                }
                const result = await Cart.insertOne(data)
                res.send(result)
            } catch (error) {
                res.status(500).send({ error: "Failed to add item to cart." });
            }
        });


        app.get('/Cart/:email', async (req, res) => {
            const data = req.params.email
            const query={email:data}
            const result = await Cart.find(query).toArray()
            res.send(result)

        })
        
        app.patch("/cart/:id", async (req, res) => {
            const { id } = req.params;
            const { quantity } = req.body;

         
            if (quantity < 1) {
                return res.status(400).json({ error: "Quantity must be at least 1" });
            }

            try {
              
                const result = await Cart.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { quantity:quantity } }
                  );
             
                if (!result) {
                    return res.status(404).json({ error: "Item not found" });
                }

                res.json({ message: "Cart item updated successfully", updatedItem: result });
            } catch (error) {
                console.error("Error updating cart item:", error);
                res.status(500).json({ error: "Failed to update cart item" });
            }
        });

        app.delete('/deleteItem/:id',async(req,res)=>{
            const id=req.params.id
          
            const query={_id:new ObjectId(id)}
            const result=await Cart.deleteOne(query)
            res.send(result)
        })
        app.delete('/deleteAll',async(req,res)=>{
            const result =await Cart.deleteMany({})
            res.send(result)
        })
        app.get('/CardDetails/:id',async(req,res)=>{
            const data=req.params.id
            const query={_id:new ObjectId(data)}
            const result=await Shop.findOne(query)
            res.send(result)
        })

        app.get('/categories',async(req,res)=>{
            
        const result= await Category.find().toArray()
        res.send(result)
        // console.log(result)
        })
        app.get('/products',async(req,res)=>{
            result= await Shop.find().toArray()
            res.send(result)
        })

        
        
      
    } finally {


    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {

})
