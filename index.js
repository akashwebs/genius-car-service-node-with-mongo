const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app=express();

//use middileaware
app.use(cors());
app.use(express.json());

const port=process.env.PORT || 5000;




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvbrr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
      await client.connect();
      const serviceCollection=client.db('geniusCar').collection('service');

      app.get('/services',async(req, res)=>{
        const query={};
        const cursor=serviceCollection.find(query);
        const result=await cursor.toArray();
        res.send(result);
      })
      app.get('/services/:id',async(req, res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await serviceCollection.findOne(query);
        res.send(result);

      })

    //   post
    app.post('/service',async(req, res)=>{
        const service=req.body;
        const result=await serviceCollection.insertOne(service);
        res.send(result);
    })
    // delete data
    app.delete('/service/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result=await serviceCollection.deleteOne(query);
      res.send(result);
    })
  }
  finally{

  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('hello world');
})
app.listen(port, ()=>{
    console.log('succses fullly ', port);
})
